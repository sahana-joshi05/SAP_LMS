package com.svlms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "follow_ups")
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(name = "follow_up_at", nullable = false)
    private LocalDateTime followUpAt;

    @Column(length = 80)
    private String type;

    @Column(length = 120)
    private String outcome;

    @Column(length = 2000)
    private String notes;

    @Column(name = "next_follow_up_at")
    private LocalDateTime nextFollowUpAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FollowUp() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Lead getLead() { return lead; }
    public void setLead(Lead lead) { this.lead = lead; }
    public LocalDateTime getFollowUpAt() { return followUpAt; }
    public void setFollowUpAt(LocalDateTime followUpAt) { this.followUpAt = followUpAt; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getNextFollowUpAt() { return nextFollowUpAt; }
    public void setNextFollowUpAt(LocalDateTime nextFollowUpAt) { this.nextFollowUpAt = nextFollowUpAt; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
