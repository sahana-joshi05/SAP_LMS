package com.svlms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDateTime enrollmentDate = LocalDateTime.now();

    private String status = "active";

    @Column(name = "personal_details", length = 4000)
    private String personalDetails;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    private String gender;

    private String state;

    private String country;

    @Column(name = "educational_details", length = 4000)
    private String educationalDetails;

    private String degree;

    @Column(name = "passed_year")
    private String passedYear;

    private String marks;

    private String university;

    @Column(name = "fee_details", length = 2000)
    private String feeDetails;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "remaining_payment_amount")
    private Double remainingPaymentAmount = 0.0;

    @Column(name = "fee_due_date")
    private String feeDueDate;

    @Column(name = "document_details", length = 4000)
    private String documentDetails;

    public Student() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Lead getLead() { return lead; }
    public void setLead(Lead lead) { this.lead = lead; }
    public LocalDateTime getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDateTime enrollmentDate) { this.enrollmentDate = enrollmentDate; }
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
}
