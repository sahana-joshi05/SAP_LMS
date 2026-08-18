package com.svlms.service;

import com.svlms.dto.request.MarkAttendanceRequest;
import com.svlms.dto.response.AttendanceResponse;
import com.svlms.entity.*;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ForbiddenException;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.*;
import com.svlms.security.AuthPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, BatchRepository batchRepository,
                              StudentRepository studentRepository, UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.batchRepository = batchRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> mark(MarkAttendanceRequest request, AuthPrincipal principal) {
        if (request.getBatchId() == null || request.getSessionDate() == null
                || request.getRecords() == null || request.getRecords().isEmpty()) {
            throw new BadRequestException("batch_id, session_date, and records[] are required");
        }

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if ("TRAINER".equals(principal.getRole())) {
            if (batch.getTrainer() == null || !batch.getTrainer().getId().equals(principal.getId())) {
                throw new ForbiddenException("You can only mark attendance for your own batch");
            }
        }

        LocalDate sessionDate = LocalDate.parse(request.getSessionDate());
        User markedBy = userRepository.findById(principal.getId()).orElseThrow();

        for (MarkAttendanceRequest.AttendanceRecordItem r : request.getRecords()) {
            Student student = studentRepository.findById(r.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            Attendance.Status status = Attendance.Status.valueOf(r.getStatus());

            Attendance att = attendanceRepository.findByBatchAndStudentAndSessionDate(batch, student, sessionDate)
                    .orElseGet(Attendance::new);
            att.setBatch(batch);
            att.setStudent(student);
            att.setSessionDate(sessionDate);
            att.setStatus(status);
            att.setMarkedBy(markedBy);
            attendanceRepository.save(att);
        }

        return Map.of("message", "Attendance recorded", "batch_id", batch.getId(),
                "session_date", sessionDate.toString(), "count", request.getRecords().size());
    }

    public List<AttendanceResponse> forBatch(Long batchId) {
        Batch batch = batchRepository.findById(batchId).orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        return attendanceRepository.findByBatchOrderBySessionDateDesc(batch).stream().map(a -> {
            AttendanceResponse dto = new AttendanceResponse();
            dto.setId(a.getId());
            dto.setStudentName(a.getStudent().getUser().getName());
            dto.setSessionDate(a.getSessionDate().toString());
            dto.setStatus(a.getStatus().name());
            return dto;
        }).toList();
    }

    public List<AttendanceResponse> myAttendance(AuthPrincipal principal) {
        Student student = studentRepository.findByUserId(principal.getId()).orElse(null);
        if (student == null) return List.of();
        return attendanceRepository.findByStudentOrderBySessionDateDesc(student).stream().map(a -> {
            AttendanceResponse dto = new AttendanceResponse();
            dto.setId(a.getId());
            dto.setSessionDate(a.getSessionDate().toString());
            dto.setStatus(a.getStatus().name());
            return dto;
        }).toList();
    }
}
