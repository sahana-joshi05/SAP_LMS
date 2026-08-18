package com.svlms.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Default EmailService: logs the email instead of sending it. This is intentional for
 * the MVP - it means password reset and notification flows work end-to-end without
 * requiring an SMTP account, SendGrid key, or any external setup.
 *
 * To send real emails in production, implement EmailService with JavaMailSender (add
 * spring-boot-starter-mail to pom.xml) or a provider SDK, annotate it @Primary, and this
 * class will stop being used automatically - no other code needs to change since
 * everything depends on the EmailService interface, not this class directly.
 */
@Service
public class ConsoleEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(ConsoleEmailService.class);

    @Override
    public void send(String toEmail, String subject, String body) {
        log.info("=================================================================");
        log.info(" [DEV EMAIL - not actually sent, see EmailService.java to enable real email]");
        log.info(" To:      {}", toEmail);
        log.info(" Subject: {}", subject);
        log.info(" Body:    {}", body);
        log.info("=================================================================");
    }
}
