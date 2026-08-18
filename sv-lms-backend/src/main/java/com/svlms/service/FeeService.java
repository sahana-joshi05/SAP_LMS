package com.svlms.service;

import com.svlms.dto.request.CreateFeeRequest;
import com.svlms.dto.request.PayFeeRequest;
import com.svlms.dto.response.FeeResponse;
import com.svlms.entity.*;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.*;
import com.svlms.security.AuthPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class FeeService {

    private final FeeRepository feeRepository;
    private final FeeTransactionRepository feeTransactionRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public FeeService(FeeRepository feeRepository, FeeTransactionRepository feeTransactionRepository,
                       StudentRepository studentRepository, CourseRepository courseRepository,
                       UserRepository userRepository) {
        this.feeRepository = feeRepository;
        this.feeTransactionRepository = feeTransactionRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public FeeResponse createPlan(CreateFeeRequest request) {
        if (request.getStudentId() == null || request.getCourseId() == null || request.getTotalFee() == null) {
            throw new BadRequestException("student_id, course_id, total_fee are required");
        }
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Fee fee = new Fee();
        fee.setStudent(student);
        fee.setCourse(course);
        fee.setTotalFee(request.getTotalFee());
        fee.setAmountPaid(0.0);
        fee.setDueAmount(request.getTotalFee());
        fee.setPlan(request.getPlan() != null ? request.getPlan() : "full");
        feeRepository.save(fee);

        return toResponse(fee);
    }

    @Transactional
    public Map<String, Object> pay(Long feeId, PayFeeRequest request, AuthPrincipal principal) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new BadRequestException("A valid amount is required");
        }
        Fee fee = feeRepository.findById(feeId).orElseThrow(() -> new ResourceNotFoundException("Fee record not found"));
        if (request.getAmount() > fee.getDueAmount()) {
            throw new BadRequestException("Amount exceeds due balance");
        }

        FeeTransaction txn = new FeeTransaction();
        txn.setFee(fee);
        txn.setAmount(request.getAmount());
        txn.setPaymentMode(request.getPaymentMode() != null ? request.getPaymentMode() : "cash");
        txn.setReceiptNo(request.getReceiptNo());
        txn.setCollectedBy(userRepository.findById(principal.getId()).orElseThrow());
        feeTransactionRepository.save(txn);

        fee.setAmountPaid(fee.getAmountPaid() + request.getAmount());
        fee.setDueAmount(fee.getDueAmount() - request.getAmount());
        feeRepository.save(fee);

        return Map.of("message", "Payment recorded", "fee", toResponse(fee));
    }

    public List<FeeResponse> forStudent(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return feeRepository.findByStudent(student).stream().map(this::toResponse).toList();
    }

    public List<FeeResponse> myFees(AuthPrincipal principal) {
        Student student = studentRepository.findByUserId(principal.getId()).orElse(null);
        if (student == null) return List.of();
        return feeRepository.findByStudent(student).stream().map(this::toResponse).toList();
    }

    private FeeResponse toResponse(Fee f) {
        FeeResponse dto = new FeeResponse();
        dto.setId(f.getId());
        dto.setTotalFee(f.getTotalFee());
        dto.setAmountPaid(f.getAmountPaid());
        dto.setDueAmount(f.getDueAmount());
        dto.setPlan(f.getPlan());
        return dto;
    }
}
