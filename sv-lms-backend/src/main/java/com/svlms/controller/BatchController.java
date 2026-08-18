package com.svlms.controller;

import com.svlms.dto.request.CreateBatchRequest;
import com.svlms.dto.request.EnrollStudentRequest;
import com.svlms.dto.response.BatchResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.BatchService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATIONS','SUPERADMIN')")
    public BatchResponse create(@RequestBody CreateBatchRequest request) {
        return batchService.create(request);
    }

    @GetMapping
    public List<BatchResponse> list(@AuthenticationPrincipal AuthPrincipal principal) {
        return batchService.list(principal);
    }

    @GetMapping("/{id}")
    public BatchResponse.Detail getOne(@PathVariable Long id) {
        return batchService.getOne(id);
    }

    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasAnyRole('OPERATIONS','SUPERADMIN')")
    public Map<String, Object> enroll(@PathVariable Long id, @RequestBody EnrollStudentRequest request) {
        return batchService.enroll(id, request);
    }
}
