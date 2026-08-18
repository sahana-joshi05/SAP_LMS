package com.svlms.dto.request;

public class CreateCourseRequest {
    private String name;
    private String code;
    private String description;
    private String duration;
    private Double fee;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public Double getFee() { return fee; }
    public void setFee(Double fee) { this.fee = fee; }
}
