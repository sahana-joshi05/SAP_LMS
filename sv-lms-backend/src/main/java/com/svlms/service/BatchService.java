package com.svlms.service;

import com.svlms.dto.request.CreateBatchRequest;
import com.svlms.dto.request.EnrollStudentRequest;
import com.svlms.dto.response.BatchResponse;
import com.svlms.entity.*;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ConflictException;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.*;
import com.svlms.security.AuthPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class BatchService {

    private final BatchRepository batchRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final BatchStudentRepository batchStudentRepository;

    public BatchService(BatchRepository batchRepository, CourseRepository courseRepository,
                         UserRepository userRepository, StudentRepository studentRepository,
                         BatchStudentRepository batchStudentRepository) {
        this.batchRepository = batchRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.batchStudentRepository = batchStudentRepository;
    }

    public BatchResponse create(CreateBatchRequest request) {
        if (request.getCourseId() == null || request.getBatchName() == null) {
            throw new BadRequestException("course_id and batch_name are required");
        }
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Batch batch = new Batch();
        batch.setCourse(course);
        batch.setBatchName(request.getBatchName());

        if (request.getTrainerId() != null) {
            User trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer not found"));
            if (trainer.getRole() != User.Role.TRAINER) throw new ResourceNotFoundException("Trainer not found");
            batch.setTrainer(trainer);
        }
        if (request.getStartDate() != null && !request.getStartDate().isBlank()) {
            batch.setStartDate(LocalDate.parse(request.getStartDate()));
        }
        if (request.getMode() != null) batch.setMode(Batch.Mode.valueOf(request.getMode()));
        if (request.getTiming() != null) batch.setTiming(request.getTiming());

        batchRepository.save(batch);
        return toResponse(batch);
    }

    public List<BatchResponse> list(AuthPrincipal principal) {
        List<Batch> batches;
        if ("TRAINER".equals(principal.getRole())) {
            User trainer = userRepository.findById(principal.getId()).orElseThrow();
            batches = batchRepository.findByTrainerOrderByCreatedAtDesc(trainer);
        } else if ("STUDENT".equals(principal.getRole())) {
            Student student = studentRepository.findByUserId(principal.getId()).orElse(null);
            if (student == null) return List.of();
            batches = batchStudentRepository.findByStudent(student).stream().map(BatchStudent::getBatch).toList();
        } else {
            batches = batchRepository.findAllByOrderByCreatedAtDesc();
        }
        return batches.stream().map(this::toResponse).toList();
    }

    public BatchResponse.Detail getOne(Long id) {
        Batch batch = batchRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        BatchResponse.Detail detail = new BatchResponse.Detail();
        copyFields(batch, detail);

        List<BatchResponse.RosterItem> roster = batchStudentRepository.findByBatch(batch).stream()
                .map(bs -> {
                    Student s = bs.getStudent();
                    return new BatchResponse.RosterItem(s.getId(), s.getUser().getName(), s.getUser().getEmail());
                }).toList();
        detail.setRoster(roster);
        return detail;
    }

    public Map<String, Object> enroll(Long batchId, EnrollStudentRequest request) {
        if (request.getStudentId() == null) throw new BadRequestException("student_id is required");

        Batch batch = batchRepository.findById(batchId).orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (batchStudentRepository.existsByBatchAndStudent(batch, student)) {
            throw new ConflictException("Student already enrolled in this batch");
        }

        BatchStudent bs = new BatchStudent();
        bs.setBatch(batch);
        bs.setStudent(student);
        batchStudentRepository.save(bs);

        return Map.of("message", "Student enrolled", "batch_id", batchId, "student_id", student.getId());
    }

    private BatchResponse toResponse(Batch b) {
        BatchResponse dto = new BatchResponse();
        copyFields(b, dto);
        return dto;
    }

    private void copyFields(Batch b, BatchResponse dto) {
        dto.setId(b.getId());
        dto.setBatchName(b.getBatchName());
        dto.setCourseName(b.getCourse().getName());
        dto.setCourseId(b.getCourse().getId());
        dto.setTrainerId(b.getTrainer() != null ? b.getTrainer().getId() : null);
        dto.setMode(b.getMode().name());
        dto.setTiming(b.getTiming());
        dto.setStatus(b.getStatus().name());
        dto.setStartDate(b.getStartDate() != null ? b.getStartDate().toString() : null);
    }
}
