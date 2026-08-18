package com.svlms.controller;

import com.svlms.dto.request.MarkAttendanceRequest;
import com.svlms.dto.response.AttendanceResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.AttendanceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATIONS','TRAINER','SUPERADMIN')")
    public Map<String, Object> mark(@RequestBody MarkAttendanceRequest request, @AuthenticationPrincipal AuthPrincipal principal) {
        return attendanceService.mark(request, principal);
    }

    @GetMapping("/batch/{batchId}")
    @PreAuthorize("hasAnyRole('OPERATIONS','TRAINER','SUPERADMIN')")
    public List<AttendanceResponse> forBatch(@PathVariable Long batchId) {
        return attendanceService.forBatch(batchId);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AttendanceResponse> myAttendance(@AuthenticationPrincipal AuthPrincipal principal) {
        return attendanceService.myAttendance(principal);
    }
}
