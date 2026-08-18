package com.svlms.service;

import com.svlms.security.AuthPrincipal;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final JdbcTemplate jdbcTemplate;

    public AuditService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void record(AuthPrincipal principal, String action, String entityType, Long entityId, String details) {
        Long actorId = principal != null ? principal.getId() : null;
        String role = principal != null ? principal.getRole() : "SYSTEM";
        jdbcTemplate.update("""
            INSERT INTO audit_logs (actor_user_id, actor_role, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?, ?)
            """, actorId, role, action, entityType, entityId, details);
    }
}
