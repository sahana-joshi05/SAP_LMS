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
        receipt.setAdmissionNumber(generateAdmissionNumber(student));
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
        emailService.sendHtml(
                toEmail,
                "SV Curiotech Admission Receipt - " + receipt.getReceiptNumber(),
                buildReceiptHtml(receipt),
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
                State: %s
                Country: %s
                Mobile No: %s
                Email ID: %s
                Date of Birth: %s
                Gender: %s

                Education Details
                Degree: %s
                Passed Year: %s
                Marks: %s
                University: %s
                Notes: %s

                Fees Details
                Course Fees: %.2f
                Paid Fees: %.2f
                Remaining Amount To Be Paid: %.2f
                Due Date: %s
                Fee Notes: %s

                Bank Details
                Payment Mode: %s
                Transaction ID: %s
                Bank Name: %s

                Admission Confirmed By Counselor:
                %s

                Document Details:
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
                safe(student(r).getState()),
                safe(student(r).getCountry()),
                safe(r.getStudent().getUser().getPhone()),
                safe(r.getStudent().getUser().getEmail()),
                safe(student(r).getDateOfBirth()),
                safe(student(r).getGender()),
                safe(student(r).getDegree()),
                safe(student(r).getPassedYear()),
                safe(student(r).getMarks()),
                safe(student(r).getUniversity()),
                safe(student(r).getEducationalDetails()),
                n(r.getTotalAmount()),
                n(r.getAmountPaid()),
                n(r.getBalanceAmount()),
                safe(student(r).getFeeDueDate()),
                safe(student(r).getFeeDetails()),
                safe(r.getPaymentMode()),
                safe(r.getTransactionId()),
                safe(r.getBankName()),
                safe(r.getIssuedBy().getName()),
                safe(student(r).getDocumentDetails())
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
                body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #f8fafc; }
                .receipt { max-width: 820px; margin: 0 auto; background: white; border: 1px solid #cbd5e1; padding: 26px 30px; }
                .brand { text-align: center; border-bottom: 2px solid #1d4ed8; padding-bottom: 14px; margin-bottom: 18px; }
                .brand h1 { margin: 0 0 6px; font-size: 22px; letter-spacing: .04em; }
                .brand p { margin: 0; font-size: 12px; color: #475569; }
                .title-row { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; gap: 12px; }
                .title-row h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
                .stamp { border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; padding: 7px 10px; font-weight: 700; font-size: 12px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #e2e8f0; border-bottom: none; }
                .cell { padding: 9px 11px; border-bottom: 1px solid #e2e8f0; min-height: 40px; }
                .cell:nth-child(odd) { border-right: 1px solid #e2e8f0; }
                .label { display: block; font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
                .value { font-size: 13px; font-weight: 700; overflow-wrap: anywhere; }
                .section { margin-top: 18px; }
                .section h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #1e293b; }
                table { width: 100%%; border-collapse: collapse; font-size: 13px; }
                th, td { border: 1px solid #e2e8f0; padding: 9px 10px; text-align: left; }
                th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 10px; }
                .amount-due { color: #b91c1c; font-weight: 800; }
                .note-box { border: 1px solid #e2e8f0; padding: 10px; min-height: 42px; font-size: 13px; white-space: pre-wrap; }
                .terms { margin-top: 18px; font-size: 11px; color: #475569; line-height: 1.55; border-top: 1px solid #e2e8f0; padding-top: 12px; }
                .footer { margin-top: 28px; display: grid; grid-template-columns: 1fr 240px; gap: 20px; align-items: end; }
                .signature { border-top: 1px solid #0f172a; padding-top: 7px; text-align: center; font-weight: 700; }
                @media print { body { padding: 0; background: white; } .receipt { border: none; } }
                @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .cell:nth-child(odd) { border-right: none; } .title-row, .footer { display: block; } }
              </style>
            </head>
            <body>
              <main class="receipt">
                <div class="brand">
                  <h1>SV CURIOTECH</h1>
                  <p>SAP Training Institute | Admission Confirmation & Payment Receipt</p>
                </div>
                <div class="title-row">
                  <h2>Admission Receipt</h2>
                  <div class="stamp">CONFIRMED ADMISSION</div>
                </div>
                <div class="grid">
                  %s
                </div>
                <div class="section">
                  <h3>Educational Details</h3>
                  <table>
                    <thead><tr><th>Degree</th><th>Passed Year</th><th>Marks</th><th>University</th></tr></thead>
                    <tbody><tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr></tbody>
                  </table>
                  <div class="note-box">%s</div>
                </div>
                <div class="section">
                  <h3>Fee & Payment Details</h3>
                  <table>
                    <thead><tr><th>Course Fees</th><th>Amount Paid</th><th>Remaining Amount To Be Paid</th><th>Due Date</th></tr></thead>
                    <tbody><tr><td>%s</td><td>%s</td><td class="amount-due">%s</td><td>%s</td></tr></tbody>
                  </table>
                  <div class="note-box">%s</div>
                </div>
                <div class="section">
                  <h3>Transaction Details</h3>
                  <table>
                    <tbody>
                      <tr><th>Payment Mode</th><td>%s</td><th>Transaction ID</th><td>%s</td></tr>
                      <tr><th>Bank Name</th><td>%s</td><th>Receipt No</th><td>%s</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="section">
                  <h3>Document Details</h3>
                  <div class="note-box">%s</div>
                </div>
                <div class="terms">
                  This receipt confirms admission based on the details provided by the student and verified by the counselor. Remaining fees, if any, must be paid on or before the due date. No refund of fees paid is allowed unless separately approved in writing by institute management.
                </div>
                <div class="footer">
                  <div><span class="label">Generated Date</span><div class="value">%s</div></div>
                  <div>
                    <div class="signature">%s<br><span class="label">Admission Confirmed By Counselor</span></div>
                  </div>
                </div>
              </main>
            </body>
            </html>
            """.formatted(
                escape(r.getReceiptNumber()),
                receiptCells(r),
                escape(student(r).getDegree()),
                escape(student(r).getPassedYear()),
                escape(student(r).getMarks()),
                escape(student(r).getUniversity()),
                escape(student(r).getEducationalDetails()),
                money(r.getTotalAmount()),
                money(r.getAmountPaid()),
                money(r.getBalanceAmount()),
                escape(student(r).getFeeDueDate()),
                escape(student(r).getFeeDetails()),
                escape(r.getPaymentMode()),
                escape(r.getTransactionId()),
                escape(r.getBankName()),
                escape(r.getReceiptNumber()),
                escape(student(r).getDocumentDetails()),
                formatDate(r.getIssuedDate()),
                escape(r.getIssuedBy().getName())
        );
    }

    private String receiptCells(Receipt r) {
        return cells(
                "Admission ID", r.getAdmissionNumber(),
                "Receipt No", r.getReceiptNumber(),
                "Name Of Candidate", r.getStudent().getUser().getName(),
                "Admission For", r.getPurpose(),
                "Date Of Birth", student(r).getDateOfBirth(),
                "Gender", student(r).getGender(),
                "Email ID", r.getStudent().getUser().getEmail(),
                "Mobile No", r.getStudent().getUser().getPhone(),
                "Address", r.getApplicantAddress(),
                "City", r.getApplicantCity(),
                "State", student(r).getState(),
                "Country", student(r).getCountry(),
                "Amount In Words", r.getAmountInWords(),
                "Counselor", r.getIssuedBy().getName()
        );
    }

    private String cells(String... values) {
        StringBuilder html = new StringBuilder();
        for (int i = 0; i < values.length; i += 2) {
            html.append("<div class=\"cell\"><span class=\"label\">")
                    .append(escape(values[i]))
                    .append("</span><div class=\"value\">")
                    .append(escape(values[i + 1]))
                    .append("</div></div>");
        }
        return html.toString();
    }

    private String generateAdmissionNumber(Student student) {
        String month = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM")).toUpperCase();
        return String.format("SV/%s/%05d", month, student.getId());
    }

    private Student student(Receipt receipt) {
        return receipt.getStudent();
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
