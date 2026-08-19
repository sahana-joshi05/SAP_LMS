package com.svlms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Simulates the exact manual click-through described in the README's "Manually test
 * the full workflow end-to-end" step: Counselor adds a lead -> converts to student ->
 * Operations enrolls the student and collects a fee -> Trainer uploads material and
 * marks attendance -> the new Student logs in and sees all of it.
 *
 * Runs against an in-memory H2 database (see application-test.yml), not PostgreSQL, so
 * it needs no external services - just `mvn test`.
 *
 * DataSeeder runs automatically on context startup (it's a CommandLineRunner bean),
 * which is why this test can log straight in as superadmin/counselor/operations/trainer
 * without creating them first - see DataSeeder.java for those seeded credentials.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LmsWorkflowIntegrationTest {

    private static final String DEMO_PASSWORD = "Password@123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullWorkflow_leadToStudentDashboard_worksEndToEnd() throws Exception {
        // ---- 1. Every seeded role can log in ----
        String superAdminToken = loginAndGetToken("superadmin@sapinstitute.com", DEMO_PASSWORD);
        String counselorToken = loginAndGetToken("counselor@sapinstitute.com", DEMO_PASSWORD);
        String operationsToken = loginAndGetToken("operations@sapinstitute.com", DEMO_PASSWORD);
        String trainerToken = loginAndGetToken("trainer@sapinstitute.com", DEMO_PASSWORD);

        assertThat(superAdminToken).isNotBlank();
        assertThat(counselorToken).isNotBlank();
        assertThat(operationsToken).isNotBlank();
        assertThat(trainerToken).isNotBlank();

        // ---- 2. Super Admin sees the demo course seeded by DataSeeder ----
        MvcResult coursesResult = mockMvc.perform(get("/api/courses").header("Authorization", bearer(superAdminToken)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode courses = objectMapper.readTree(coursesResult.getResponse().getContentAsString());
        assertThat(courses.isArray()).isTrue();
        assertThat(courses.size()).isGreaterThanOrEqualTo(1);
        long courseId = courses.get(0).get("id").asLong();

        // ---- 3. Counselor adds a lead ----
        Map<String, Object> leadPayload = Map.of(
            "name", "Test Student",
            "phone", "9999999999",
            "email", "teststudent@example.com",
            "course_interested", courseId
        );
        MvcResult leadResult = mockMvc.perform(post("/api/leads")
                        .header("Authorization", bearer(counselorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(leadPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("New"))
                .andReturn();
        long leadId = objectMapper.readTree(leadResult.getResponse().getContentAsString()).get("id").asLong();

        // ---- 4. Counselor converts the lead to a student ----
        MvcResult convertResult = mockMvc.perform(post("/api/leads/" + leadId + "/convert")
                        .header("Authorization", bearer(counselorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login_email").value("teststudent@example.com"))
                .andReturn();
        JsonNode convertJson = objectMapper.readTree(convertResult.getResponse().getContentAsString());
        long studentId = convertJson.get("student_id").asLong();
        String studentTempPassword = convertJson.get("temp_password").asText();

        // ---- 5. Operations sees the new student in the list ----
        mockMvc.perform(get("/api/students").header("Authorization", bearer(operationsToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email=='teststudent@example.com')]").exists());

        // ---- 6. Operations enrolls the student into the seeded demo batch ----
        MvcResult batchesResult = mockMvc.perform(get("/api/batches").header("Authorization", bearer(operationsToken)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode batches = objectMapper.readTree(batchesResult.getResponse().getContentAsString());
        assertThat(batches.size()).isGreaterThanOrEqualTo(1);
        long batchId = batches.get(0).get("id").asLong();

        mockMvc.perform(post("/api/batches/" + batchId + "/enroll")
                        .header("Authorization", bearer(operationsToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("student_id", studentId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Student enrolled"));

        // ---- 7. Operations sets up a fee plan and records a payment ----
        MvcResult feeResult = mockMvc.perform(post("/api/fees")
                        .header("Authorization", bearer(operationsToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "student_id", studentId, "course_id", courseId, "total_fee", 45000))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.due_amount").value(45000.0))
                .andReturn();
        long feeId = objectMapper.readTree(feeResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/fees/" + feeId + "/pay")
                        .header("Authorization", bearer(operationsToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "amount", 20000, "payment_mode", "upi", "receipt_no", "RCPT001"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fee.due_amount").value(25000.0))
                .andExpect(jsonPath("$.fee.amount_paid").value(20000.0));

        // ---- 8. Operations marks attendance for the batch ----
        Map<String, Object> attendancePayload = Map.of(
            "batch_id", batchId,
            "session_date", "2026-08-06",
            "records", java.util.List.of(Map.of("student_id", studentId, "status", "present"))
        );
        mockMvc.perform(post("/api/attendance")
                        .header("Authorization", bearer(operationsToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(attendancePayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        // ---- 9. Trainer uploads course material to the same batch ----
        mockMvc.perform(post("/api/content")
                        .header("Authorization", bearer(trainerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "batch_id", batchId, "title", "Module 1 - GL Accounting",
                                "type", "material", "body", "https://example.com/gl-notes.pdf"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Module 1 - GL Accounting"));

        // ---- 10. The new student logs in with the generated temp password ----
        String studentToken = loginAndGetToken("teststudent@example.com", studentTempPassword);
        assertThat(studentToken).isNotBlank();

        // ---- 11. Student sees their enrolled batch ----
        mockMvc.perform(get("/api/students/me/summary").header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.batches[0].batch_name").exists());

        // ---- 12. Student sees the material the trainer uploaded ----
        mockMvc.perform(get("/api/content/batch/" + batchId).header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Module 1 - GL Accounting"));

        // ---- 13. Student sees their own attendance ----
        mockMvc.perform(get("/api/attendance/me").header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("present"));

        // ---- 14. Student sees their fee due balance ----
        mockMvc.perform(get("/api/fees/me").header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].due_amount").value(25000.0));
    }

    @Test
    void roleBasedAccessControl_studentCannotCreateCourse() throws Exception {
        // A student converted from a lead in the test above doesn't exist yet in this
        // isolated test, so seed one directly via the Counselor -> convert flow instead
        // of assuming ordering between test methods.
        String counselorToken = loginAndGetToken("counselor@sapinstitute.com", DEMO_PASSWORD);

        MvcResult leadResult = mockMvc.perform(post("/api/leads")
                        .header("Authorization", bearer(counselorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "RBAC Test Lead", "email", "rbactest@example.com"))))
                .andExpect(status().isOk())
                .andReturn();
        long leadId = objectMapper.readTree(leadResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/leads/" + leadId + "/convert")
                        .header("Authorization", bearer(counselorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        String studentToken = loginAndGetToken("rbactest@example.com", "Student@123");

        // A student has no business creating a course - this must be rejected, not silently allowed
        mockMvc.perform(post("/api/courses")
                        .header("Authorization", bearer(studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Should Not Be Created"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginRateLimiter_locksOutAfterRepeatedFailures() throws Exception {
        // Uses a made-up email rather than a shared seeded account - the rate limiter
        // keys purely on the email string in the request (see LoginRateLimiter.java),
        // so this validates the mechanism just as well without risking locking out an
        // account another test in this class also needs to log in as.
        String email = "ratelimit-test@example.com";

        // Exhaust the configured attempt limit (5, per application-test.yml) with wrong passwords
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("email", email, "password", "wrong-password"))))
                    .andExpect(status().isUnauthorized());
        }

        // The 6th attempt should be rejected as rate-limited
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", "wrong-password"))))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void adminRole_canCreateStaffButNotSuperAdminOrAdmin() throws Exception {
        String superAdminToken = loginAndGetToken("superadmin@sapinstitute.com", DEMO_PASSWORD);

        // Super Admin creates the Admin test account (DataSeeder already seeds one at
        // admin@sapinstitute.com, but creating a second one here keeps this test
        // self-contained and independent of DataSeeder's specific accounts)
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(superAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Test Admin", "email", "testadmin@example.com",
                                "password", DEMO_PASSWORD, "role", "admin"))))
                .andExpect(status().isOk());

        String adminToken = loginAndGetToken("testadmin@example.com", DEMO_PASSWORD);

        // Admin CAN create operational staff
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "New Trainer", "email", "newtrainer@example.com",
                                "password", DEMO_PASSWORD, "role", "trainer"))))
                .andExpect(status().isOk());

        // Admin CANNOT create another Admin
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Should Fail", "email", "shouldfail@example.com",
                                "password", DEMO_PASSWORD, "role", "admin"))))
                .andExpect(status().isForbidden());

        // Admin CANNOT create a Super Admin
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Should Also Fail", "email", "shouldalsofail@example.com",
                                "password", DEMO_PASSWORD, "role", "superadmin"))))
                .andExpect(status().isForbidden());

        // Admin CANNOT create Student credentials directly; Super Admin owns that flow.
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Student Should Fail", "email", "studentfail@example.com",
                                "password", DEMO_PASSWORD, "role", "student"))))
                .andExpect(status().isForbidden());

        // Admin CAN add a course
        mockMvc.perform(post("/api/courses")
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "SAP MM"))))
                .andExpect(status().isOk());
    }

    @Test
    void superAdmin_canCreateCredentialsForEveryNonSuperAdminRole() throws Exception {
        String superAdminToken = loginAndGetToken("superadmin@sapinstitute.com", DEMO_PASSWORD);

        for (String role : java.util.List.of("admin", "counselor", "operations", "seo", "trainer", "student")) {
            String email = "created-" + role + "@example.com";
            mockMvc.perform(post("/api/users")
                            .header("Authorization", bearer(superAdminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of(
                                    "name", "Created " + role,
                                    "email", email,
                                    "password", DEMO_PASSWORD,
                                    "role", role))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.role").value(role));

            assertThat(loginAndGetToken(email, DEMO_PASSWORD)).isNotBlank();
        }

        String operationsToken = loginAndGetToken("operations@sapinstitute.com", DEMO_PASSWORD);
        mockMvc.perform(get("/api/students").header("Authorization", bearer(operationsToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email=='created-student@example.com')]").exists());
    }

    @Autowired
    private com.svlms.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private com.svlms.repository.UserRepository userRepository;

    @Test
    void passwordResetFlow_worksEndToEnd() throws Exception {
        // Use a freshly created, dedicated account for this test rather than one of the
        // shared seeded demo accounts (operations@sapinstitute.com etc.) - JUnit doesn't
        // guarantee test method execution order, so changing a shared account's password
        // here could break a different test that logs in as that same account.
        String email = "resettest@example.com";
        String superAdminToken = loginAndGetToken("superadmin@sapinstitute.com", DEMO_PASSWORD);
        mockMvc.perform(post("/api/users")
                        .header("Authorization", bearer(superAdminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Reset Test User", "email", email,
                                "password", DEMO_PASSWORD, "role", "trainer"))))
                .andExpect(status().isOk());

        // Request a reset - always returns the same generic message
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        // Also returns 200 with the same generic message for an email that doesn't
        // exist - this is intentional (prevents attackers from probing which emails
        // have accounts)
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "doesnotexist@example.com"))))
                .andExpect(status().isOk());

        // An invalid/garbage token must be rejected
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("token", "not-a-real-token", "new_password", "NewPass@1234"))))
                .andExpect(status().isBadRequest());

        // Now prove the REAL happy path: fetch the token that was actually generated
        // and persisted for this user (ConsoleEmailService only logs it, doesn't
        // return it via the API by design - that's a deliberate security choice, not
        // a test limitation, so the test reaches into the repository directly instead)
        var user = userRepository.findByEmail(email).orElseThrow();
        var tokens = passwordResetTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()) && !t.isUsed())
                .toList();
        assertThat(tokens).isNotEmpty();
        String realToken = tokens.get(tokens.size() - 1).getToken();

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("token", realToken, "new_password", "NewPass@1234"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        // Old password no longer works
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", DEMO_PASSWORD))))
                .andExpect(status().isUnauthorized());

        // New password works
        String newToken = loginAndGetToken(email, "NewPass@1234");
        assertThat(newToken).isNotBlank();

        // The same token can't be reused for a second reset
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("token", realToken, "new_password", "AnotherPass@1"))))
                .andExpect(status().isBadRequest());
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
