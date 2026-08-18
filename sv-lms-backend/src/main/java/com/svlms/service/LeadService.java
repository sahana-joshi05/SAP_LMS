package com.svlms.service;

import com.svlms.dto.request.ConvertLeadRequest;
import com.svlms.dto.request.CreateLeadRequest;
import com.svlms.dto.request.UpdateLeadRequest;
import com.svlms.dto.response.ConvertLeadResponse;
import com.svlms.dto.response.LeadResponse;
import com.svlms.dto.response.ReceiptResponse;
import com.svlms.entity.*;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ConflictException;
import com.svlms.exception.ForbiddenException;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.*;
import com.svlms.security.AuthPrincipal;
import com.svlms.util.PasswordUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReceiptService receiptService;

    public LeadService(LeadRepository leadRepository, UserRepository userRepository,
                        CourseRepository courseRepository, StudentRepository studentRepository,
                        PasswordEncoder passwordEncoder, ReceiptService receiptService) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.receiptService = receiptService;
    }

    public LeadResponse create(CreateLeadRequest request, AuthPrincipal principal) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Lead name is required");
        }

        Lead lead = new Lead();
        lead.setName(request.getName());
        lead.setPhone(request.getPhone());
        lead.setEmail(request.getEmail());
        lead.setSource(request.getSource() != null ? request.getSource() : "manual");
        lead.setNotes(request.getNotes());

        if ("COUNSELOR".equals(principal.getRole())) {
            lead.setAssignedCounselor(userRepository.findById(principal.getId()).orElseThrow());
        } else if (request.getAssignedCounselorId() != null) {
            userRepository.findById(request.getAssignedCounselorId()).ifPresent(lead::setAssignedCounselor);
        }

        if (request.getCourseInterested() != null) {
            courseRepository.findById(request.getCourseInterested()).ifPresent(lead::setCourseInterested);
        }

        leadRepository.save(lead);
        return toResponse(lead);
    }

    public List<LeadResponse> list(AuthPrincipal principal) {
        List<Lead> leads;
        if ("COUNSELOR".equals(principal.getRole())) {
            User counselor = userRepository.findById(principal.getId()).orElseThrow();
            leads = leadRepository.findByAssignedCounselorOrderByCreatedAtDesc(counselor);
        } else {
            leads = leadRepository.findAllByOrderByCreatedAtDesc();
        }
        return leads.stream().map(this::toResponse).toList();
    }

    public LeadResponse updateStatus(Long id, UpdateLeadRequest request, AuthPrincipal principal) {
        Lead lead = findLeadOrThrow(id);
        assertOwnLeadOrAdmin(lead, principal, "update");

        if (request.getStatus() != null) {
            lead.setStatus(Lead.Status.valueOf(request.getStatus()));
        }
        if (request.getNotes() != null) {
            lead.setNotes(request.getNotes());
        }
        leadRepository.save(lead);
        return toResponse(lead);
    }

    @Transactional
    public ConvertLeadResponse convert(Long id, ConvertLeadRequest request, AuthPrincipal principal) {
        Lead lead = findLeadOrThrow(id);
        assertOwnLeadOrAdmin(lead, principal, "convert");

        if (lead.getEmail() == null || lead.getEmail().isBlank()) {
            throw new BadRequestException("Lead must have an email to create a student login");
        }
        if (userRepository.existsByEmail(lead.getEmail())) {
            throw new ConflictException("A user with this email already exists");
        }

        String tempPassword = (request != null && request.getPassword() != null)
                ? request.getPassword() : PasswordUtil.defaultTempPassword();

        User user = new User();
        user.setName(lead.getName());
        user.setEmail(lead.getEmail());
        user.setPhone(lead.getPhone());
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setRole(User.Role.STUDENT);
        userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setLead(lead);
        studentRepository.save(student);

        lead.setStatus(Lead.Status.Enrolled);
        leadRepository.save(lead);

        ReceiptResponse receipt = null;
        // Generate and send admission receipt when lead is converted to student
        try {
            if (lead.getCourseInterested() != null) {
                Double totalFee = lead.getCourseInterested().getFee() != null 
                    ? lead.getCourseInterested().getFee() : 0.0;
                Double totalAmount = request != null && request.getTotalAmount() != null ? request.getTotalAmount() : totalFee;
                Double amountPaid = request != null && request.getAmountPaid() != null ? request.getAmountPaid() : 0.0;
                receipt = receiptService.createReceiptForAdmission(
                    lead.getId(),
                    lead.getCourseInterested().getId(),
                    totalAmount,
                    amountPaid,
                    request != null ? request.getPaymentMode() : null,
                    request != null ? request.getTransactionId() : null,
                    request != null ? request.getBankName() : null,
                    request != null ? request.getApplicantAddress() : null,
                    request != null ? request.getApplicantCity() : null,
                    principal
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to generate receipt for lead " + lead.getId() + ": " + e.getMessage());
        }

        ConvertLeadResponse response = new ConvertLeadResponse("Lead converted to student", student.getId(), lead.getEmail(), tempPassword);
        if (receipt != null) {
            response.setReceiptId(receipt.getId());
            response.setReceiptNumber(receipt.getReceiptNumber());
        }
        return response;
    }

    private Lead findLeadOrThrow(Long id) {
        return leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
    }

    private void assertOwnLeadOrAdmin(Lead lead, AuthPrincipal principal, String action) {
        if ("COUNSELOR".equals(principal.getRole())) {
            if (lead.getAssignedCounselor() == null || !lead.getAssignedCounselor().getId().equals(principal.getId())) {
                throw new ForbiddenException("You can only " + action + " your own leads");
            }
        }
    }

    private LeadResponse toResponse(Lead l) {
        LeadResponse dto = new LeadResponse();
        dto.setId(l.getId());
        dto.setName(l.getName());
        dto.setPhone(l.getPhone());
        dto.setEmail(l.getEmail());
        dto.setSource(l.getSource());
        dto.setStatus(l.getStatus().name());
        dto.setNotes(l.getNotes());
        dto.setCreatedAt(l.getCreatedAt().toString());
        return dto;
    }
}
