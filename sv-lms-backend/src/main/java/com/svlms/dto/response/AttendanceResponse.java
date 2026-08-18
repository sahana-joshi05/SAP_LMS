package com.svlms.dto.response;

public class AttendanceResponse {
    private Long id;
    private String studentName;
    private String sessionDate;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getSessionDate() { return sessionDate; }
    public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
