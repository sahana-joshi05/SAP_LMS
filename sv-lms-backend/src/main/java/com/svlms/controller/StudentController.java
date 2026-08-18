package com.svlms.controller;

import com.svlms.dto.response.StudentResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.StudentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERATIONS','SUPERADMIN','ADMIN','COUNSELOR')")
    public List<StudentResponse> list() {
        return studentService.list();
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS')")
    public Map<String, Object> overview() {
        return studentService.overview();
    }

    @GetMapping("/me/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentResponse.Summary mySummary(@AuthenticationPrincipal AuthPrincipal principal) {
        return studentService.mySummary(principal);
    }
}
