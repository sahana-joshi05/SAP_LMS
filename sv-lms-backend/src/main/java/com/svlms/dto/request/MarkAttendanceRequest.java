package com.svlms.dto.request;

import java.util.List;

public class MarkAttendanceRequest {
    private Long batchId;
    private String sessionDate;
    private List<AttendanceRecordItem> records;

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getSessionDate() { return sessionDate; }
    public void setSessionDate(String sessionDate) { this.sessionDate = sessionDate; }
    public List<AttendanceRecordItem> getRecords() { return records; }
    public void setRecords(List<AttendanceRecordItem> records) { this.records = records; }

    public static class AttendanceRecordItem {
        private Long studentId;
        private String status;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
