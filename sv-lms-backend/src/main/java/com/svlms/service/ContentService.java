package com.svlms.service;

import com.svlms.dto.request.CreateContentRequest;
import com.svlms.dto.response.ContentResponse;
import com.svlms.entity.*;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ForbiddenException;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.*;
import com.svlms.security.AuthPrincipal;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ContentService {

    private final ContentRepository contentRepository;
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final BatchStudentRepository batchStudentRepository;
    private final UserRepository userRepository;

    public ContentService(ContentRepository contentRepository, BatchRepository batchRepository,
                           StudentRepository studentRepository, BatchStudentRepository batchStudentRepository,
                           UserRepository userRepository) {
        this.contentRepository = contentRepository;
        this.batchRepository = batchRepository;
        this.studentRepository = studentRepository;
        this.batchStudentRepository = batchStudentRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> create(CreateContentRequest request, AuthPrincipal principal) {
        if (request.getBatchId() == null || request.getTitle() == null) {
            throw new BadRequestException("batch_id and title are required");
        }
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if ("TRAINER".equals(principal.getRole())) {
            if (batch.getTrainer() == null || !batch.getTrainer().getId().equals(principal.getId())) {
                throw new ForbiddenException("You can only upload content to your own batch");
            }
        }

        Content content = new Content();
        content.setBatch(batch);
        content.setTitle(request.getTitle());
        if (request.getType() != null) content.setType(Content.Type.valueOf(request.getType()));
        content.setBody(request.getBody());
        content.setUploadedBy(userRepository.findById(principal.getId()).orElseThrow());
        contentRepository.save(content);

        return Map.of("id", content.getId(), "batch_id", batch.getId(), "title", content.getTitle());
    }

    public List<ContentResponse> forBatch(Long batchId, AuthPrincipal principal) {
        Batch batch = batchRepository.findById(batchId).orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if ("STUDENT".equals(principal.getRole())) {
            Student student = studentRepository.findByUserId(principal.getId()).orElse(null);
            boolean enrolled = student != null && batchStudentRepository.existsByBatchAndStudent(batch, student);
            if (!enrolled) throw new ForbiddenException("You are not enrolled in this batch");
        }

        return contentRepository.findByBatchOrderByUploadedAtDesc(batch).stream().map(c -> {
            ContentResponse dto = new ContentResponse();
            dto.setId(c.getId());
            dto.setTitle(c.getTitle());
            dto.setType(c.getType().name());
            dto.setBody(c.getBody() != null ? c.getBody() : "");
            dto.setUploadedAt(c.getUploadedAt().toString());
            return dto;
        }).toList();
    }
}
