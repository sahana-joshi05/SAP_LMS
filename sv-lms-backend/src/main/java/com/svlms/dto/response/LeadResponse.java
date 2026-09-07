package com.svlms.dto.response;

public class LeadResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String source;
    private String status;
    private String notes;
    private String createdAt;
    private Long assignedCounselorId;
    private String assignedCounselorName;
    private String assignedCounselorEmail;
    private Long courseInterestedId;
    private String courseInterestedName;

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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public Long getAssignedCounselorId() { return assignedCounselorId; }
    public void setAssignedCounselorId(Long assignedCounselorId) { this.assignedCounselorId = assignedCounselorId; }
    public String getAssignedCounselorName() { return assignedCounselorName; }
    public void setAssignedCounselorName(String assignedCounselorName) { this.assignedCounselorName = assignedCounselorName; }
    public String getAssignedCounselorEmail() { return assignedCounselorEmail; }
    public void setAssignedCounselorEmail(String assignedCounselorEmail) { this.assignedCounselorEmail = assignedCounselorEmail; }
    public Long getCourseInterestedId() { return courseInterestedId; }
    public void setCourseInterestedId(Long courseInterestedId) { this.courseInterestedId = courseInterestedId; }
    public String getCourseInterestedName() { return courseInterestedName; }
    public void setCourseInterestedName(String courseInterestedName) { this.courseInterestedName = courseInterestedName; }
}
