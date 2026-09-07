package com.svlms.service;

import com.svlms.dto.response.BatchResponse;
import com.svlms.dto.response.StudentResponse;
import com.svlms.entity.Batch;
import com.svlms.entity.BatchStudent;
import com.svlms.entity.Student;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.*;
import com.svlms.security.AuthPrincipal;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final BatchStudentRepository batchStudentRepository;
    private final LeadRepository leadRepository;
    private final CourseRepository courseRepository;

    public StudentService(StudentRepository studentRepository, BatchRepository batchRepository,
                           BatchStudentRepository batchStudentRepository, LeadRepository leadRepository,
                           CourseRepository courseRepository) {
        this.studentRepository = studentRepository;
        this.batchRepository = batchRepository;
        this.batchStudentRepository = batchStudentRepository;
        this.leadRepository = leadRepository;
        this.courseRepository = courseRepository;
    }

    public List<StudentResponse> list() {
        return studentRepository.findAll().stream().map(this::toResponse).toList();
    }

    // Kept as a raw Map (not a typed DTO) so the JSON keys stay camelCase (totalStudents, totalBatches...),
    // matching what the existing dashboard UI expects, independent of the global snake_case setting.
    public Map<String, Object> overview() {
        return Map.of(
            "totalStudents", studentRepository.count(),
            "totalBatches", batchRepository.count(),
            "totalLeads", leadRepository.count(),
            "totalCourses", courseRepository.count()
        );
    }

    public StudentResponse.Summary mySummary(AuthPrincipal principal) {
        Student student = studentRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found"));

        List<BatchResponse> batches = batchStudentRepository.findByStudent(student).stream().map(bs -> {
            Batch b = bs.getBatch();
            BatchResponse dto = new BatchResponse();
            dto.setId(b.getId());
            dto.setBatchName(b.getBatchName());
            dto.setCourseName(b.getCourse().getName());
            dto.setMode(b.getMode().name());
            dto.setTiming(b.getTiming());
            return dto;
        }).toList();

        Map<String, Object> studentMap = new LinkedHashMap<>();
        studentMap.put("id", student.getId());
        studentMap.put("enrollment_date", student.getEnrollmentDate().toString());
        studentMap.put("status", student.getStatus());
        studentMap.put("personal_details", safe(student.getPersonalDetails()));
        studentMap.put("date_of_birth", safe(student.getDateOfBirth()));
        studentMap.put("gender", safe(student.getGender()));
        studentMap.put("state", safe(student.getState()));
        studentMap.put("country", safe(student.getCountry()));
        studentMap.put("educational_details", safe(student.getEducationalDetails()));
        studentMap.put("degree", safe(student.getDegree()));
        studentMap.put("passed_year", safe(student.getPassedYear()));
        studentMap.put("marks", safe(student.getMarks()));
        studentMap.put("university", safe(student.getUniversity()));
        studentMap.put("fee_details", safe(student.getFeeDetails()));
        studentMap.put("transaction_id", safe(student.getTransactionId()));
        studentMap.put("remaining_payment_amount", student.getRemainingPaymentAmount() != null ? student.getRemainingPaymentAmount() : 0.0);
        studentMap.put("fee_due_date", safe(student.getFeeDueDate()));
        studentMap.put("document_details", safe(student.getDocumentDetails()));

        return new StudentResponse.Summary(studentMap, batches);
    }

    private StudentResponse toResponse(Student s) {
        StudentResponse dto = new StudentResponse();
        dto.setId(s.getId());
        dto.setName(s.getUser().getName());
        dto.setEmail(s.getUser().getEmail());
        dto.setPhone(s.getUser().getPhone() != null ? s.getUser().getPhone() : "");
        dto.setEnrollmentDate(s.getEnrollmentDate().toString());
        dto.setStatus(s.getStatus());
        dto.setPersonalDetails(safe(s.getPersonalDetails()));
        dto.setDateOfBirth(safe(s.getDateOfBirth()));
        dto.setGender(safe(s.getGender()));
        dto.setState(safe(s.getState()));
        dto.setCountry(safe(s.getCountry()));
        dto.setEducationalDetails(safe(s.getEducationalDetails()));
        dto.setDegree(safe(s.getDegree()));
        dto.setPassedYear(safe(s.getPassedYear()));
        dto.setMarks(safe(s.getMarks()));
        dto.setUniversity(safe(s.getUniversity()));
        dto.setFeeDetails(safe(s.getFeeDetails()));
        dto.setTransactionId(safe(s.getTransactionId()));
        dto.setRemainingPaymentAmount(s.getRemainingPaymentAmount() != null ? s.getRemainingPaymentAmount() : 0.0);
        dto.setFeeDueDate(safe(s.getFeeDueDate()));
        dto.setDocumentDetails(safe(s.getDocumentDetails()));
        return dto;
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}
