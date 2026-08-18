package com.svlms.controller;

import com.svlms.dto.request.CreateFeeRequest;
import com.svlms.dto.request.PayFeeRequest;
import com.svlms.dto.response.FeeResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.FeeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATIONS','SUPERADMIN')")
    public FeeResponse createPlan(@RequestBody CreateFeeRequest request) {
        return feeService.createPlan(request);
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('OPERATIONS','SUPERADMIN')")
    public Map<String, Object> pay(@PathVariable Long id, @RequestBody PayFeeRequest request,
                                    @AuthenticationPrincipal AuthPrincipal principal) {
        return feeService.pay(id, request, principal);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('OPERATIONS','SUPERADMIN','ADMIN')")
    public List<FeeResponse> forStudent(@PathVariable Long studentId) {
        return feeService.forStudent(studentId);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public List<FeeResponse> myFees(@AuthenticationPrincipal AuthPrincipal principal) {
        return feeService.myFees(principal);
    }
}
