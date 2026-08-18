package com.svlms.service;

import com.svlms.dto.request.CreateReceiptRequest;
import com.svlms.dto.response.ReceiptResponse;
import com.svlms.entity.*;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ForbiddenException;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.*;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.email.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final LeadRepository leadRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ReceiptService(ReceiptRepository receiptRepository, LeadRepository leadRepository,
                          StudentRepository studentRepository, CourseRepository courseRepository,
                          UserRepository userRepository, EmailService emailService) {
        this.receiptRepository = receiptRepository;
        this.leadRepository = leadRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Generate receipt number based on current month and year
     * Format: RCP/MMM/YYY/XXXX (e.g., RCP/Aug/026/0001)
     */
    private String generateReceiptNumber() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        DateTimeFormatter yearFormatter = DateTimeFormatter.ofPattern("yy");
        
        String month = now.format(monthFormatter).toUpperCase();
        String year = now.format(yearFormatter);
        
        // Get count of receipts issued this month
        long count = receiptRepository.findAllByOrderByIssuedDateDesc().stream()
                .filter(r -> r.getIssuedDate().getMonthValue() == now.getMonthValue() &&
                             r.getIssuedDate().getYear() == now.getYear())
                .count();
        
        return String.format("RCP/%s/%s/%04d", month, year, count + 1);
    }

    @Transactional
    public ReceiptResponse createReceipt(CreateReceiptRequest request, AuthPrincipal principal) {
        if (request.getLeadId() == null || request.getCourseId() == null || request.getTotalAmount() == null) {
            throw new BadRequestException("lead_id, course_id, and total_amount are required");
        }

        Lead lead = leadRepository.findById(request.getLeadId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        User issuedBy = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify that the requesting user is an admin or counselor
        if (!"SUPERADMIN".equals(principal.getRole()) && !"COUNSELOR".equals(principal.getRole()) && !"OPERATIONS".equals(principal.getRole())) {
            throw new ForbiddenException("Only admins, counselors, or operations staff can issue receipts");
        }

        // Get or create student from lead
        Student student = studentRepository.findByLead(lead).orElse(null);
        if (student == null) {
            throw new BadRequestException("Lead must be converted to a student first");
        }

        Receipt receipt = new Receipt();
        receipt.setReceiptNumber(generateReceiptNumber());
        receipt.setLead(lead);
        receipt.setStudent(student);
        receipt.setCourse(course);
        receipt.setIssuedBy(issuedBy);
        receipt.setTotalAmount(request.getTotalAmount());
        receipt.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : 0.0);
        receipt.setBalanceAmount(request.getTotalAmount() - (request.getAmountPaid() != null ? request.getAmountPaid() : 0.0));
        receipt.setPaymentMode(request.getPaymentMode());
        receipt.setTransactionId(request.getTransactionId());
        receipt.setBankName(request.getBankName());
        receipt.setAdmissionNumber(String.valueOf(student.getId()));
        receipt.setApplicantAddress(firstNonBlank(request.getApplicantAddress(), lead.getNotes()));
        receipt.setApplicantCity(request.getApplicantCity());
        receipt.setAmountInWords(toRupeesWords(receipt.getAmountPaid()));
        receipt.setPurpose(course.getName());
        receipt.setReceivedDate(LocalDateTime.now());

        receiptRepository.save(receipt);
        sendReceiptToApplicant(receipt);
        return toResponse(receipt);
    }

    @Transactional
    public ReceiptResponse createReceiptForLead(Long leadId, Long courseId, Double totalAmount,
                                                 Double amountPaid, String paymentMode,
                                                 String transactionId, String bankName,
                                                 AuthPrincipal principal) {
        CreateReceiptRequest request = new CreateReceiptRequest();
        request.setLeadId(leadId);
        request.setCourseId(courseId);
        request.setTotalAmount(totalAmount);
        request.setAmountPaid(amountPaid);
        request.setPaymentMode(paymentMode);
        request.setTransactionId(transactionId);
        request.setBankName(bankName);

        return createReceipt(request, principal);
    }

    @Transactional
    public ReceiptResponse createReceiptForAdmission(Long leadId, Long courseId, Double totalAmount,
                                                     Double amountPaid, String paymentMode,
                                                     String transactionId, String bankName,
                                                     String applicantAddress, String applicantCity,
                                                     AuthPrincipal principal) {
        CreateReceiptRequest request = new CreateReceiptRequest();
        request.setLeadId(leadId);
        request.setCourseId(courseId);
        request.setTotalAmount(totalAmount);
        request.setAmountPaid(amountPaid);
        request.setPaymentMode(paymentMode);
        request.setTransactionId(transactionId);
        request.setBankName(bankName);
        request.setApplicantAddress(applicantAddress);
        request.setApplicantCity(applicantCity);
        return createReceipt(request, principal);
    }

    public List<ReceiptResponse> getStudentReceipts(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return receiptRepository.findByStudentOrderByIssuedDateDesc(student)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReceiptResponse> getAllReceipts() {
        return receiptRepository.findAllByOrderByIssuedDateDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ReceiptResponse getReceiptById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found"));
        return toResponse(receipt);
    }

    public ReceiptResponse getReceiptByNumber(String receiptNumber) {
        Receipt receipt = receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found"));
        return toResponse(receipt);
    }

    public String getPrintableReceiptHtml(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found"));
        return buildReceiptHtml(receipt);
    }

    private void sendReceiptToApplicant(Receipt receipt) {
        String toEmail = receipt.getStudent().getUser().getEmail();
        if (toEmail == null || toEmail.isBlank()) return;
        emailService.send(
                toEmail,
                "SV Curiotech Admission Receipt - " + receipt.getReceiptNumber(),
                buildPlainTextReceipt(receipt)
        );
        receipt.setSentToApplicantAt(LocalDateTime.now());
        receiptRepository.save(receipt);
    }

    private String buildPlainTextReceipt(Receipt r) {
        return """
                SV Curiotech Admission Receipt

                Date: %s
                Admission NO: %s
                Receipt NO: %s
                Amount Received From: %s
                Amount In Rupees: %s
                Purpose OF Payment: %s
                Address: %s
                City: %s
                Mobile No: %s
                Email ID: %s

                Fees Details
                Course Fees: %.2f
                Paid Fees: %.2f
                Balance Fees: %.2f

                Bank Details
                Payment Mode: %s
                Transaction ID: %s
                Bank Name: %s

                Amount Received By:
                %s
                """.formatted(
                formatDate(r.getIssuedDate()),
                safe(r.getAdmissionNumber()),
                safe(r.getReceiptNumber()),
                safe(r.getStudent().getUser().getName()),
                safe(r.getAmountInWords()),
                safe(r.getPurpose()),
                safe(r.getApplicantAddress()),
                safe(r.getApplicantCity()),
                safe(r.getStudent().getUser().getPhone()),
                safe(r.getStudent().getUser().getEmail()),
                n(r.getTotalAmount()),
                n(r.getAmountPaid()),
                n(r.getBalanceAmount()),
                safe(r.getPaymentMode()),
                safe(r.getTransactionId()),
                safe(r.getBankName()),
                safe(r.getIssuedBy().getName())
        );
    }

    private String buildReceiptHtml(Receipt r) {
        return """
            <!doctype html>
            <html>
            <head>
              <meta charset="utf-8" />
              <title>%s</title>
              <style>
                body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 28px; }
                .receipt { max-width: 760px; margin: 0 auto; border: 1px solid #d1d5db; padding: 30px 36px; }
                .top { text-align: right; margin-bottom: 18px; }
                h1 { text-align: center; font-size: 20px; margin: 0 0 20px; }
                .row { display: grid; grid-template-columns: 210px 1fr; gap: 14px; margin: 8px 0; font-size: 14px; }
                .label { font-weight: 700; }
                h2 { font-size: 16px; margin: 24px 0 10px; }
                .footer { margin-top: 34px; display: grid; grid-template-columns: 1fr 220px; }
                .name { margin-top: 24px; font-weight: 700; }
                @media print { body { padding: 0; } .receipt { border: none; } }
              </style>
            </head>
            <body>
              <main class="receipt">
                <h1>SV Curiotech Admission Receipt</h1>
                <div class="top"><span class="label">Date:</span> %s</div>
                %s
                <h2>Fees Details</h2>
                %s
                <h2>Bank Details</h2>
                %s
                <div class="footer">
                  <div></div>
                  <div>
                    <div class="label">Amount Received By:</div>
                    <div class="name">%s</div>
                  </div>
                </div>
              </main>
            </body>
            </html>
            """.formatted(
                escape(r.getReceiptNumber()),
                formatDate(r.getIssuedDate()),
                rows(
                    "Admission NO", r.getAdmissionNumber(),
                    "Receipt NO", r.getReceiptNumber(),
                    "Amount Received From", r.getStudent().getUser().getName(),
                    "Amount In Rupees", r.getAmountInWords(),
                    "Purpose OF Payment", r.getPurpose(),
                    "Address", r.getApplicantAddress(),
                    "City", r.getApplicantCity(),
                    "Mobile No", r.getStudent().getUser().getPhone(),
                    "Email ID", r.getStudent().getUser().getEmail()
                ),
                rows(
                    "Course Fees", money(r.getTotalAmount()),
                    "Paid Fees", money(r.getAmountPaid()),
                    "Balance Fees", money(r.getBalanceAmount())
                ),
                rows(
                    "Payment Mode", r.getPaymentMode(),
                    "Transaction ID", r.getTransactionId(),
                    "Bank Name", r.getBankName()
                ),
                escape(r.getIssuedBy().getName())
        );
    }

    private ReceiptResponse toResponse(Receipt receipt) {
        ReceiptResponse dto = new ReceiptResponse();
        dto.setId(receipt.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setAdmissionNumber(receipt.getAdmissionNumber());

        if (receipt.getStudent() != null) {
            dto.setStudentId(receipt.getStudent().getId());
            if (receipt.getStudent().getUser() != null) {
                dto.setStudentName(receipt.getStudent().getUser().getName());
                dto.setStudentEmail(receipt.getStudent().getUser().getEmail());
                dto.setStudentPhone(receipt.getStudent().getUser().getPhone());
            }
        }

        if (receipt.getLead() != null) {
            dto.setStudentAddress(receipt.getApplicantAddress());
            dto.setStudentCity(receipt.getApplicantCity());
        }

        if (receipt.getCourse() != null) {
            dto.setCourseId(receipt.getCourse().getId());
            dto.setCourseName(receipt.getCourse().getName());
            dto.setCourseFee(receipt.getCourse().getFee());
        }

        if (receipt.getIssuedBy() != null) {
            dto.setIssuedByName(receipt.getIssuedBy().getName());
        }

        dto.setTotalAmount(receipt.getTotalAmount());
        dto.setAmountPaid(receipt.getAmountPaid());
        dto.setBalanceAmount(receipt.getBalanceAmount());
        dto.setPaymentMode(receipt.getPaymentMode());
        dto.setTransactionId(receipt.getTransactionId());
        dto.setBankName(receipt.getBankName());
        dto.setAmountInWords(receipt.getAmountInWords());
        dto.setPurpose(receipt.getPurpose());

        if (receipt.getIssuedDate() != null) {
            dto.setIssuedDate(receipt.getIssuedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        if (receipt.getSentToApplicantAt() != null) {
            dto.setSentToApplicantAt(receipt.getSentToApplicantAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }

        return dto;
    }

    private String rows(String... values) {
        StringBuilder html = new StringBuilder();
        for (int i = 0; i < values.length; i += 2) {
            html.append("<div class=\"row\"><div class=\"label\">")
                    .append(escape(values[i]))
                    .append(":</div><div>")
                    .append(escape(values[i + 1]))
                    .append("</div></div>");
        }
        return html.toString();
    }

    private String toRupeesWords(Double value) {
        long amount = Math.round(value != null ? value : 0);
        if (amount == 0) return "Zero Rupees Only";
        return capitalizeWords(numberToWords(amount)) + " Rupees Only";
    }

    private String numberToWords(long n) {
        String[] belowTwenty = {"", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
                "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"};
        String[] tens = {"", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"};
        if (n < 20) return belowTwenty[(int) n];
        if (n < 100) return tens[(int) n / 10] + (n % 10 == 0 ? "" : " " + numberToWords(n % 10));
        if (n < 1000) return numberToWords(n / 100) + " hundred" + (n % 100 == 0 ? "" : " " + numberToWords(n % 100));
        if (n < 100000) return numberToWords(n / 1000) + " thousand" + (n % 1000 == 0 ? "" : " " + numberToWords(n % 1000));
        if (n < 10000000) return numberToWords(n / 100000) + " lakh" + (n % 100000 == 0 ? "" : " " + numberToWords(n % 100000));
        return numberToWords(n / 10000000) + " crore" + (n % 10000000 == 0 ? "" : " " + numberToWords(n % 10000000));
    }

    private String capitalizeWords(String value) {
        String[] words = value.split(" ");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!word.isBlank()) {
                if (!result.isEmpty()) result.append(' ');
                result.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
            }
        }
        return result.toString();
    }

    private String firstNonBlank(String a, String b) {
        return a != null && !a.isBlank() ? a : b;
    }

    private String formatDate(LocalDateTime value) {
        return value != null ? value.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "";
    }

    private String money(Double value) {
        return String.format("%.2f", n(value));
    }

    private double n(Double value) {
        return value != null ? value : 0.0;
    }

    private String safe(String value) {
        return value != null ? value : "";
    }

    private String escape(String value) {
        return safe(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
