package com.svlms.dto.request;

public class CreateLeadRequest {
    private String name;
    private String phone;
    private String email;
    private String source;
    private Long assignedCounselorId;
    private Long courseInterested;
    private String notes;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Long getAssignedCounselorId() { return assignedCounselorId; }
    public void setAssignedCounselorId(Long assignedCounselorId) { this.assignedCounselorId = assignedCounselorId; }
    public Long getCourseInterested() { return courseInterested; }
    public void setCourseInterested(Long courseInterested) { this.courseInterested = courseInterested; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
