package com.svlms.controller;

import com.svlms.dto.request.CreateReceiptRequest;
import com.svlms.dto.response.ReceiptResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.ReceiptService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COUNSELOR','OPERATIONS','SUPERADMIN')")
    public ReceiptResponse createReceipt(@RequestBody CreateReceiptRequest request,
                                         @AuthenticationPrincipal AuthPrincipal principal) {
        return receiptService.createReceipt(request, principal);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OPERATIONS','ADMIN','STUDENT')")
    public List<ReceiptResponse> getStudentReceipts(@PathVariable Long studentId) {
        return receiptService.getStudentReceipts(studentId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OPERATIONS','ADMIN','STUDENT','COUNSELOR')")
    public ReceiptResponse getReceipt(@PathVariable Long id) {
        return receiptService.getReceiptById(id);
    }

    @GetMapping(value = "/{id}/print", produces = MediaType.TEXT_HTML_VALUE)
    @PreAuthorize("hasAnyRole('SUPERADMIN','OPERATIONS','ADMIN','STUDENT','COUNSELOR')")
    public String printReceipt(@PathVariable Long id) {
        return receiptService.getPrintableReceiptHtml(id);
    }

    @GetMapping("/number/{receiptNumber}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OPERATIONS','ADMIN','STUDENT','COUNSELOR')")
    public ReceiptResponse getReceiptByNumber(@PathVariable String receiptNumber) {
        return receiptService.getReceiptByNumber(receiptNumber);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN','OPERATIONS','ADMIN','COUNSELOR')")
    public List<ReceiptResponse> getAllReceipts() {
        return receiptService.getAllReceipts();
    }
}
