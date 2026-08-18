package com.svlms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
public class Lead {

    public enum Status {
        New,
        Contacted,
        Interested,
        Positive,
        Call_Not_Received,
        Follow_up,
        Demo_Workshop,
        Negotiation,
        Enrolled,
        Converted,
        Not_Interested,
        Lost
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String email;

    private String source = "manual";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.New;

    @ManyToOne
    @JoinColumn(name = "assigned_counselor_id")
    private User assignedCounselor;

    @ManyToOne
    @JoinColumn(name = "course_interested_id")
    private Course courseInterested;

    @Column(length = 2000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Lead() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public User getAssignedCounselor() { return assignedCounselor; }
    public void setAssignedCounselor(User assignedCounselor) { this.assignedCounselor = assignedCounselor; }
    public Course getCourseInterested() { return courseInterested; }
    public void setCourseInterested(Course courseInterested) { this.courseInterested = courseInterested; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
