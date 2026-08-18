package com.svlms.dto.response;

public class FeeResponse {
    private Long id;
    private Double totalFee;
    private Double amountPaid;
    private Double dueAmount;
    private String plan;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getTotalFee() { return totalFee; }
    public void setTotalFee(Double totalFee) { this.totalFee = totalFee; }
    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }
    public Double getDueAmount() { return dueAmount; }
    public void setDueAmount(Double dueAmount) { this.dueAmount = dueAmount; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
}
