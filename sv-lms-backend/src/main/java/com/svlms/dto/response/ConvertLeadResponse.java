package com.svlms.dto.response;

public class ConvertLeadResponse {
    private String message;
    private Long studentId;
    private String loginEmail;
    private String tempPassword;
    private Long receiptId;
    private String receiptNumber;

    public ConvertLeadResponse(String message, Long studentId, String loginEmail, String tempPassword) {
        this.message = message;
        this.studentId = studentId;
        this.loginEmail = loginEmail;
        this.tempPassword = tempPassword;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getLoginEmail() { return loginEmail; }
    public void setLoginEmail(String loginEmail) { this.loginEmail = loginEmail; }
    public String getTempPassword() { return tempPassword; }
    public void setTempPassword(String tempPassword) { this.tempPassword = tempPassword; }
    public Long getReceiptId() { return receiptId; }
    public void setReceiptId(Long receiptId) { this.receiptId = receiptId; }
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
}
