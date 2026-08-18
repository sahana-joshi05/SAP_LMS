package com.svlms.dto.request;

public class CreateContentRequest {
    private Long batchId;
    private String title;
    private String type;
    private String body;

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
