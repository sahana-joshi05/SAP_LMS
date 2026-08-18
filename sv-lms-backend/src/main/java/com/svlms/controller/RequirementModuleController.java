package com.svlms.controller;

import com.svlms.security.AuthPrincipal;
import com.svlms.service.RequirementModuleService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RequirementModuleController {

    private final RequirementModuleService service;

    public RequirementModuleController(RequirementModuleService service) {
        this.service = service;
    }

    @GetMapping("/follow-ups")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','COUNSELOR','OPERATIONS')")
    public List<Map<String, Object>> followUps(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.followUps(principal);
    }

    @PostMapping("/follow-ups")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','COUNSELOR')")
    public Map<String, Object> createFollowUp(@RequestBody Map<String, Object> request,
                                              @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createFollowUp(request, principal);
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','STUDENT')")
    public List<Map<String, Object>> tickets(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.tickets(principal);
    }

    @PostMapping("/tickets")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','STUDENT')")
    public Map<String, Object> createTicket(@RequestBody Map<String, Object> request,
                                            @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createTicket(request, principal);
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','TRAINER','STUDENT')")
    public List<Map<String, Object>> assignments(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.assignments(principal);
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','TRAINER')")
    public Map<String, Object> createAssignment(@RequestBody Map<String, Object> request,
                                                @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createAssignment(request, principal);
    }

    @GetMapping("/assignment-submissions")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','TRAINER','STUDENT')")
    public List<Map<String, Object>> assignmentSubmissions(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.assignmentSubmissions(principal);
    }

    @PostMapping("/assignments/{id}/submissions")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','TRAINER','STUDENT')")
    public Map<String, Object> submitAssignment(@PathVariable Long id, @RequestBody Map<String, Object> request,
                                                @AuthenticationPrincipal AuthPrincipal principal) {
        return service.submitAssignment(id, request, principal);
    }

    @GetMapping("/exams")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','TRAINER','STUDENT')")
    public List<Map<String, Object>> exams(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.exams(principal);
    }

    @PostMapping("/exams")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','TRAINER')")
    public Map<String, Object> createExam(@RequestBody Map<String, Object> request,
                                          @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createExam(request, principal);
    }

    @GetMapping("/certificates")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','STUDENT')")
    public List<Map<String, Object>> certificates(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.certificates(principal);
    }

    @PostMapping("/certificates")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS')")
    public Map<String, Object> createCertificate(@RequestBody Map<String, Object> request,
                                                 @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createCertificate(request, principal);
    }

    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> notifications(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.notifications(principal);
    }

    @PostMapping("/notifications")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','COUNSELOR')")
    public Map<String, Object> createNotification(@RequestBody Map<String, Object> request,
                                                  @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createNotification(request, principal);
    }

    @GetMapping("/seo/keywords")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SEO')")
    public List<Map<String, Object>> seoKeywords() {
        return service.seoKeywords();
    }

    @PostMapping("/seo/keywords")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SEO')")
    public Map<String, Object> createSeoKeyword(@RequestBody Map<String, Object> request,
                                                @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createSeoKeyword(request, principal);
    }

    @GetMapping("/seo/pages")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SEO')")
    public List<Map<String, Object>> seoPages() {
        return service.seoPages();
    }

    @PostMapping("/seo/pages")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SEO')")
    public Map<String, Object> createSeoPage(@RequestBody Map<String, Object> request,
                                             @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createSeoPage(request, principal);
    }

    @GetMapping("/seo/tasks")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SEO')")
    public List<Map<String, Object>> seoTasks() {
        return service.seoTasks();
    }

    @PostMapping("/seo/tasks")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','SEO')")
    public Map<String, Object> createSeoTask(@RequestBody Map<String, Object> request,
                                             @AuthenticationPrincipal AuthPrincipal principal) {
        return service.createSeoTask(request, principal);
    }

    @GetMapping("/reports/summary")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','SEO','TRAINER')")
    public Map<String, Object> reportSummary() {
        return service.reportSummary();
    }

    @GetMapping(value = "/reports/export.csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','SEO')")
    public String reportCsv() {
        return service.reportCsv();
    }

    @GetMapping(value = "/reports/export.json", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS','SEO')")
    public Map<String, Object> reportJson() {
        return service.reportSummary();
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public List<Map<String, Object>> auditLogs() {
        return service.auditLogs();
    }
}
