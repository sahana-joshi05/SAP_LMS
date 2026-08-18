package com.svlms.dto.request;

public class ConvertLeadRequest {
    private String password;
    private Double totalAmount;
    private Double amountPaid;
    private String paymentMode;
    private String transactionId;
    private String bankName;
    private String applicantAddress;
    private String applicantCity;

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }
    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getApplicantAddress() { return applicantAddress; }
    public void setApplicantAddress(String applicantAddress) { this.applicantAddress = applicantAddress; }
    public String getApplicantCity() { return applicantCity; }
    public void setApplicantCity(String applicantCity) { this.applicantCity = applicantCity; }
}
