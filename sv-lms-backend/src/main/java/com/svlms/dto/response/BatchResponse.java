package com.svlms.dto.response;

import java.util.List;

public class BatchResponse {
    private Long id;
    private String batchName;
    private String courseName;
    private Long courseId;
    private Long trainerId;
    private String mode;
    private String timing;
    private String status;
    private String startDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getTrainerId() { return trainerId; }
    public void setTrainerId(Long trainerId) { this.trainerId = trainerId; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public static class RosterItem {
        private Long studentId;
        private String name;
        private String email;

        public RosterItem(Long studentId, String name, String email) {
            this.studentId = studentId;
            this.name = name;
            this.email = email;
        }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // Extended response for GET /batches/{id} that includes the roster
    public static class Detail extends BatchResponse {
        private List<RosterItem> roster;

        public List<RosterItem> getRoster() { return roster; }
        public void setRoster(List<RosterItem> roster) { this.roster = roster; }
    }
}
