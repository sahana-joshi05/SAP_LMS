package com.svlms.controller;

import com.svlms.dto.request.ConvertLeadRequest;
import com.svlms.dto.request.CreateLeadRequest;
import com.svlms.dto.request.UpdateLeadRequest;
import com.svlms.dto.response.ConvertLeadResponse;
import com.svlms.dto.response.LeadResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.LeadService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COUNSELOR','SUPERADMIN')")
    public LeadResponse create(@RequestBody CreateLeadRequest request, @AuthenticationPrincipal AuthPrincipal principal) {
        return leadService.create(request, principal);
    }

    @PostMapping("/public")
    public LeadResponse createPublic(@RequestBody CreateLeadRequest request) {
        return leadService.createPublic(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COUNSELOR','SUPERADMIN','OPERATIONS','SEO')")
    public List<LeadResponse> list(@AuthenticationPrincipal AuthPrincipal principal) {
        return leadService.list(principal);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('COUNSELOR','SUPERADMIN')")
    public LeadResponse updateStatus(@PathVariable Long id, @RequestBody UpdateLeadRequest request,
                                      @AuthenticationPrincipal AuthPrincipal principal) {
        return leadService.updateStatus(id, request, principal);
    }

    @PostMapping("/{id}/assign-to-me")
    @PreAuthorize("hasRole('COUNSELOR')")
    public LeadResponse assignToMe(@PathVariable Long id, @AuthenticationPrincipal AuthPrincipal principal) {
        return leadService.assignToMe(id, principal);
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyRole('COUNSELOR','SUPERADMIN')")
    public ConvertLeadResponse convert(@PathVariable Long id, @RequestBody(required = false) ConvertLeadRequest request,
                                        @AuthenticationPrincipal AuthPrincipal principal) {
        return leadService.convert(id, request, principal);
    }
}
