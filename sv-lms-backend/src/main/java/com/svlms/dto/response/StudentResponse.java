package com.svlms.dto.response;

import java.util.List;

public class StudentResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String enrollmentDate;
    private String status;
    private String personalDetails;
    private String dateOfBirth;
    private String gender;
    private String state;
    private String country;
    private String educationalDetails;
    private String degree;
    private String passedYear;
    private String marks;
    private String university;
    private String feeDetails;
    private String transactionId;
    private Double remainingPaymentAmount;
    private String feeDueDate;
    private String documentDetails;

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
    public String getPersonalDetails() { return personalDetails; }
    public void setPersonalDetails(String personalDetails) { this.personalDetails = personalDetails; }
    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getEducationalDetails() { return educationalDetails; }
    public void setEducationalDetails(String educationalDetails) { this.educationalDetails = educationalDetails; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public String getPassedYear() { return passedYear; }
    public void setPassedYear(String passedYear) { this.passedYear = passedYear; }
    public String getMarks() { return marks; }
    public void setMarks(String marks) { this.marks = marks; }
    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }
    public String getFeeDetails() { return feeDetails; }
    public void setFeeDetails(String feeDetails) { this.feeDetails = feeDetails; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Double getRemainingPaymentAmount() { return remainingPaymentAmount; }
    public void setRemainingPaymentAmount(Double remainingPaymentAmount) { this.remainingPaymentAmount = remainingPaymentAmount; }
    public String getFeeDueDate() { return feeDueDate; }
    public void setFeeDueDate(String feeDueDate) { this.feeDueDate = feeDueDate; }
    public String getDocumentDetails() { return documentDetails; }
    public void setDocumentDetails(String documentDetails) { this.documentDetails = documentDetails; }

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
