package com.svlms.controller;

import com.svlms.dto.request.CreateContentRequest;
import com.svlms.dto.response.ContentResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.ContentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TRAINER','SUPERADMIN')")
    public Map<String, Object> create(@RequestBody CreateContentRequest request, @AuthenticationPrincipal AuthPrincipal principal) {
        return contentService.create(request, principal);
    }

    @GetMapping("/batch/{batchId}")
    public List<ContentResponse> forBatch(@PathVariable Long batchId, @AuthenticationPrincipal AuthPrincipal principal) {
        return contentService.forBatch(batchId, principal);
    }
}
