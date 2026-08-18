package com.svlms.dto.request;

public class CreateFeeRequest {
    private Long studentId;
    private Long courseId;
    private Double totalFee;
    private String plan;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Double getTotalFee() { return totalFee; }
    public void setTotalFee(Double totalFee) { this.totalFee = totalFee; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
}
