package com.svlms.service.email;

/**
 * Sends transactional emails (password resets, new-student credentials, fee receipts).
 *
 * ConsoleEmailService is the only implementation right now - it logs the email instead
 * of sending it, so the whole app works out of the box with zero email provider setup.
 * Swap in a real implementation (JavaMailSender + SMTP, SendGrid, SES, etc.) by
 * implementing this same interface and marking it @Primary, or removing
 * ConsoleEmailService's @Service annotation - no other code needs to change.
 */
public interface EmailService {
    void send(String toEmail, String subject, String body);

    default void sendHtml(String toEmail, String subject, String htmlBody, String textFallback) {
        send(toEmail, subject, textFallback);
    }
}
