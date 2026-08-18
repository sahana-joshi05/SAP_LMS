package com.svlms.dto.request;

public class CreateBatchRequest {
    private Long courseId;
    private Long trainerId;
    private String batchName;
    private String startDate;
    private String mode;
    private String timing;

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getTrainerId() { return trainerId; }
    public void setTrainerId(Long trainerId) { this.trainerId = trainerId; }
    public String getBatchName() { return batchName; }
    public void setBatchName(String batchName) { this.batchName = batchName; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }
}
