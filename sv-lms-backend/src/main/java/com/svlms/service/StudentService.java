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
        return studentRepository.findAll().stream().map(s -> {
            StudentResponse dto = new StudentResponse();
            dto.setId(s.getId());
            dto.setName(s.getUser().getName());
            dto.setEmail(s.getUser().getEmail());
            dto.setPhone(s.getUser().getPhone() != null ? s.getUser().getPhone() : "");
            dto.setEnrollmentDate(s.getEnrollmentDate().toString());
            dto.setStatus(s.getStatus());
            return dto;
        }).toList();
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

        Map<String, Object> studentMap = Map.of(
            "id", student.getId(),
            "enrollment_date", student.getEnrollmentDate().toString(),
            "status", student.getStatus()
        );

        return new StudentResponse.Summary(studentMap, batches);
    }
}
