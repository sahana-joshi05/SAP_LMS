package com.svlms.service;

import com.svlms.exception.BadRequestException;
import com.svlms.security.AuthPrincipal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class RequirementModuleService {

    private final JdbcTemplate jdbcTemplate;
    private final AuditService auditService;

    public RequirementModuleService(JdbcTemplate jdbcTemplate, AuditService auditService) {
        this.jdbcTemplate = jdbcTemplate;
        this.auditService = auditService;
    }

    public List<Map<String, Object>> followUps(AuthPrincipal principal) {
        if ("COUNSELOR".equals(principal.getRole())) {
            return rows("""
                SELECT f.*, l.name AS lead_name
                FROM follow_ups f
                JOIN leads l ON l.id = f.lead_id
                WHERE l.assigned_counselor_id = ?
                ORDER BY f.follow_up_at DESC
                """, principal.getId());
        }
        return rows("""
            SELECT f.*, l.name AS lead_name
            FROM follow_ups f
            JOIN leads l ON l.id = f.lead_id
            ORDER BY f.follow_up_at DESC
            """);
    }

    public Map<String, Object> createFollowUp(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "lead_id", "follow_up_at");
        Map<String, Object> saved = insert("follow_ups", request, List.of(
            "lead_id", "follow_up_at", "type", "outcome", "notes", "next_follow_up_at"
        ), Map.of("created_by", principal.getId()));
        auditService.record(principal, "CREATE_FOLLOW_UP", "follow_ups", id(saved), saved.toString());
        return saved;
    }

    public List<Map<String, Object>> tickets(AuthPrincipal principal) {
        if ("STUDENT".equals(principal.getRole())) {
            return rows("""
                SELECT t.*
                FROM support_tickets t
                JOIN students s ON s.id = t.student_id
                WHERE s.user_id = ?
                ORDER BY t.updated_at DESC
                """, principal.getId());
        }
        return rows("SELECT * FROM support_tickets ORDER BY updated_at DESC");
    }

    public Map<String, Object> createTicket(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "subject");
        Map<String, Object> extra = new LinkedHashMap<>();
        extra.put("created_by", principal.getId());
        if ("STUDENT".equals(principal.getRole()) && !request.containsKey("student_id")) {
            Long studentId = jdbcTemplate.queryForObject("SELECT id FROM students WHERE user_id = ?", Long.class, principal.getId());
            extra.put("student_id", studentId);
        }
        Map<String, Object> saved = insert("support_tickets", request, List.of(
            "student_id", "category", "priority", "subject", "description", "status", "assigned_to", "resolution_notes"
        ), extra);
        auditService.record(principal, "CREATE_SUPPORT_TICKET", "support_tickets", id(saved), saved.toString());
        return saved;
    }

    public List<Map<String, Object>> assignments(AuthPrincipal principal) {
        if ("STUDENT".equals(principal.getRole())) {
            return rows("""
                SELECT a.*
                FROM assignments a
                JOIN batch_students bs ON bs.batch_id = a.batch_id
                JOIN students s ON s.id = bs.student_id
                WHERE s.user_id = ?
                ORDER BY a.deadline NULLS LAST, a.created_at DESC
                """, principal.getId());
        }
        if ("TRAINER".equals(principal.getRole())) {
            return rows("""
                SELECT a.*
                FROM assignments a
                JOIN batches b ON b.id = a.batch_id
                WHERE b.trainer_id = ?
                ORDER BY a.deadline NULLS LAST, a.created_at DESC
                """, principal.getId());
        }
        return rows("SELECT * FROM assignments ORDER BY deadline NULLS LAST, created_at DESC");
    }

    public Map<String, Object> createAssignment(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "batch_id", "title");
        Map<String, Object> saved = insert("assignments", request, List.of(
            "batch_id", "title", "instructions", "attachment_url", "deadline", "status"
        ), Map.of("created_by", principal.getId()));
        auditService.record(principal, "CREATE_ASSIGNMENT", "assignments", id(saved), saved.toString());
        return saved;
    }

    public List<Map<String, Object>> assignmentSubmissions(AuthPrincipal principal) {
        if ("STUDENT".equals(principal.getRole())) {
            return rows("""
                SELECT s.*
                FROM assignment_submissions s
                JOIN students st ON st.id = s.student_id
                WHERE st.user_id = ?
                ORDER BY s.submitted_at DESC
                """, principal.getId());
        }
        if ("TRAINER".equals(principal.getRole())) {
            return rows("""
                SELECT s.*
                FROM assignment_submissions s
                JOIN assignments a ON a.id = s.assignment_id
                JOIN batches b ON b.id = a.batch_id
                WHERE b.trainer_id = ?
                ORDER BY s.submitted_at DESC
                """, principal.getId());
        }
        return rows("SELECT * FROM assignment_submissions ORDER BY submitted_at DESC");
    }

    public Map<String, Object> submitAssignment(Long assignmentId, Map<String, Object> request, AuthPrincipal principal) {
        Map<String, Object> extra = new LinkedHashMap<>();
        extra.put("assignment_id", assignmentId);
        if ("STUDENT".equals(principal.getRole())) {
            Long studentId = jdbcTemplate.queryForObject("SELECT id FROM students WHERE user_id = ?", Long.class, principal.getId());
            extra.put("student_id", studentId);
        }
        requireMerged(request, extra, "student_id");
        Map<String, Object> saved = insert("assignment_submissions", request, List.of(
            "student_id", "submission_text", "submission_url", "marks", "feedback", "status", "evaluated_by", "evaluated_at"
        ), extra);
        auditService.record(principal, "SUBMIT_ASSIGNMENT", "assignment_submissions", id(saved), saved.toString());
        return saved;
    }

    public List<Map<String, Object>> exams(AuthPrincipal principal) {
        if ("STUDENT".equals(principal.getRole())) {
            return rows("""
                SELECT e.*
                FROM exams e
                JOIN batch_students bs ON bs.batch_id = e.batch_id
                JOIN students s ON s.id = bs.student_id
                WHERE s.user_id = ?
                ORDER BY e.scheduled_at NULLS LAST, e.created_at DESC
                """, principal.getId());
        }
        if ("TRAINER".equals(principal.getRole())) {
            return rows("""
                SELECT e.*
                FROM exams e
                JOIN batches b ON b.id = e.batch_id
                WHERE b.trainer_id = ?
                ORDER BY e.scheduled_at NULLS LAST, e.created_at DESC
                """, principal.getId());
        }
        return rows("SELECT * FROM exams ORDER BY scheduled_at NULLS LAST, created_at DESC");
    }

    public Map<String, Object> createExam(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "batch_id", "title");
        Map<String, Object> saved = insert("exams", request, List.of(
            "batch_id", "title", "instructions", "exam_type", "scheduled_at", "total_marks", "status"
        ), Map.of("created_by", principal.getId()));
        auditService.record(principal, "CREATE_EXAM", "exams", id(saved), saved.toString());
        return saved;
    }

    public List<Map<String, Object>> certificates(AuthPrincipal principal) {
        if ("STUDENT".equals(principal.getRole())) {
            return rows("""
                SELECT c.*
                FROM certificates c
                JOIN students s ON s.id = c.student_id
                WHERE s.user_id = ?
                ORDER BY c.created_at DESC
                """, principal.getId());
        }
        return rows("SELECT * FROM certificates ORDER BY created_at DESC");
    }

    public Map<String, Object> createCertificate(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "student_id", "certificate_number");
        Map<String, Object> saved = insert("certificates", request, List.of(
            "student_id", "course_id", "certificate_number", "eligibility_status", "issued_at", "download_url", "verification_id"
        ), Map.of("issued_by", principal.getId()));
        auditService.record(principal, "CREATE_CERTIFICATE", "certificates", id(saved), saved.toString());
        return saved;
    }

    public List<Map<String, Object>> notifications(AuthPrincipal principal) {
        if (!isAdminLike(principal) && !"OPERATIONS".equals(principal.getRole())) {
            return rows("SELECT * FROM notifications WHERE recipient_user_id = ? ORDER BY created_at DESC", principal.getId());
        }
        return rows("SELECT * FROM notifications ORDER BY created_at DESC");
    }

    public Map<String, Object> createNotification(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "message");
        Map<String, Object> saved = insert("notifications", request, List.of(
            "recipient_user_id", "channel", "template_key", "subject", "message", "status", "sent_at"
        ), Map.of("created_by", principal.getId()));
        auditService.record(principal, "CREATE_NOTIFICATION", "notifications", id(saved), saved.toString());
        return saved;
    }

    public List<Map<String, Object>> seoKeywords() {
        return rows("SELECT * FROM seo_keywords ORDER BY created_at DESC");
    }

    public Map<String, Object> createSeoKeyword(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "keyword");
        return insertAudited("seo_keywords", request, List.of(
            "keyword", "location", "search_intent", "target_page", "current_rank", "target_rank", "status", "notes"
        ), principal, "CREATE_SEO_KEYWORD");
    }

    public List<Map<String, Object>> seoPages() {
        return rows("SELECT * FROM seo_landing_pages ORDER BY created_at DESC");
    }

    public Map<String, Object> createSeoPage(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "title", "url_slug");
        return insertAudited("seo_landing_pages", request, List.of(
            "title", "meta_description", "url_slug", "h1", "content", "faq", "schema_fields", "cta", "status"
        ), principal, "CREATE_SEO_PAGE");
    }

    public List<Map<String, Object>> seoTasks() {
        return rows("SELECT * FROM seo_tasks ORDER BY created_at DESC");
    }

    public Map<String, Object> createSeoTask(Map<String, Object> request, AuthPrincipal principal) {
        require(request, "topic");
        return insertAudited("seo_tasks", request, List.of(
            "task_type", "topic", "keyword", "assignee_id", "status", "publishing_date", "target_location", "notes"
        ), principal, "CREATE_SEO_TASK");
    }

    public Map<String, Object> reportSummary() {
        return Map.of(
            "total_leads", count("leads"),
            "total_students", count("students"),
            "active_batches", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM batches WHERE status = 'ongoing'", Long.class),
            "pending_tickets", countWhere("support_tickets", "status <> 'resolved'"),
            "published_assignments", count("assignments"),
            "scheduled_exams", countWhere("exams", "status = 'scheduled'"),
            "issued_certificates", countWhere("certificates", "issued_at IS NOT NULL"),
            "seo_keywords", count("seo_keywords")
        );
    }

    public String reportCsv() {
        Map<String, Object> summary = reportSummary();
        StringBuilder csv = new StringBuilder("metric,value\n");
        summary.forEach((key, value) -> csv.append(key).append(',').append(value).append('\n'));
        return csv.toString();
    }

    public List<Map<String, Object>> auditLogs() {
        return rows("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200");
    }

    private Map<String, Object> insertAudited(String table, Map<String, Object> request, List<String> allowedColumns,
                                               AuthPrincipal principal, String action) {
        Map<String, Object> saved = insert(table, request, allowedColumns, Map.of("created_by", principal.getId()));
        auditService.record(principal, action, table, id(saved), saved.toString());
        return saved;
    }

    private Map<String, Object> insert(String table, Map<String, Object> request, List<String> allowedColumns,
                                       Map<String, Object> extraColumns) {
        LinkedHashMap<String, Object> values = new LinkedHashMap<>();
        for (String column : allowedColumns) {
            if (request.containsKey(column)) {
                Object value = request.get(column);
                if (value != null && !value.toString().isBlank()) {
                    values.put(column, value);
                }
            }
        }
        values.putAll(extraColumns);
        if (values.isEmpty()) throw new BadRequestException("No valid fields supplied");

        String columns = String.join(", ", values.keySet());
        String placeholders = String.join(", ", values.keySet().stream().map(k -> "?").toList());
        Object[] args = values.values().toArray();
        return normalize(jdbcTemplate.queryForMap("INSERT INTO " + table + " (" + columns + ") VALUES (" + placeholders + ") RETURNING *", args));
    }

    private List<Map<String, Object>> rows(String sql, Object... args) {
        return jdbcTemplate.queryForList(sql, args).stream().map(this::normalize).toList();
    }

    private Map<String, Object> normalize(Map<String, Object> row) {
        Map<String, Object> normalized = new LinkedHashMap<>();
        row.forEach((key, value) -> normalized.put(key.toLowerCase(), value != null ? value.toString() : null));
        return normalized;
    }

    private void require(Map<String, Object> request, String... fields) {
        for (String field : fields) {
            Object value = request.get(field);
            if (value == null || value.toString().isBlank()) {
                throw new BadRequestException(field + " is required");
            }
        }
    }

    private void requireMerged(Map<String, Object> request, Map<String, Object> extra, String... fields) {
        Map<String, Object> merged = new LinkedHashMap<>(request);
        merged.putAll(extra);
        require(merged, fields);
    }

    private Long id(Map<String, Object> saved) {
        Object value = saved.get("id");
        return value == null ? null : Long.valueOf(value.toString());
    }

    private Long count(String table) {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
    }

    private Long countWhere(String table, String where) {
        return jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table + " WHERE " + where, Long.class);
    }

    private boolean isAdminLike(AuthPrincipal principal) {
        return "SUPERADMIN".equals(principal.getRole()) || "ADMIN".equals(principal.getRole());
    }
}
