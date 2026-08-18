package com.svlms.dto.response;

import java.util.List;

public class StudentResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String enrollmentDate;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(String enrollmentDate) { this.enrollmentDate = enrollmentDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static class Summary {
        private Object student;
        private List<BatchResponse> batches;

        public Summary(Object student, List<BatchResponse> batches) {
            this.student = student;
            this.batches = batches;
        }

        public Object getStudent() { return student; }
        public void setStudent(Object student) { this.student = student; }
        public List<BatchResponse> getBatches() { return batches; }
        public void setBatches(List<BatchResponse> batches) { this.batches = batches; }
    }
}
