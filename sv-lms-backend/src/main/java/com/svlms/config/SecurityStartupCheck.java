package com.svlms.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Fails loud, not silent: if the app is still running with the insecure default JWT
 * secret, print an unmissable warning on startup instead of letting it slip into
 * production unnoticed. Doesn't block startup (so local dev keeps working with zero
 * setup) - it just makes sure nobody can say they weren't warned.
 */
@Component
public class SecurityStartupCheck {

    private static final Logger log = LoggerFactory.getLogger(SecurityStartupCheck.class);
    private static final String INSECURE_DEFAULT_SECRET = "dev_only_insecure_default_change_before_prod_min_32_chars";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${cors.allowed-origin}")
    private String corsAllowedOrigin;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Value("${app.email.smtp.enabled}")
    private boolean smtpEmailEnabled;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:}")
    private String mailFrom;

    @PostConstruct
    public void checkSecurityConfig() {
        if (INSECURE_DEFAULT_SECRET.equals(jwtSecret)) {
            log.warn("=================================================================");
            log.warn(" SECURITY WARNING: app.jwt.secret is using the insecure default.");
            log.warn(" Set the JWT_SECRET environment variable to a long random value");
            log.warn(" before deploying anywhere other than local development.");
            log.warn("=================================================================");
        }
        if (corsAllowedOrigin.contains("localhost")) {
            log.warn("NOTE: cors.allowed-origin is set to '{}'. Set CORS_ALLOWED_ORIGIN to your", corsAllowedOrigin);
            log.warn("real frontend domain before deploying to production.");
        }
        if (frontendBaseUrl.contains("localhost")) {
            log.warn("NOTE: app.frontend-base-url is set to '{}'. Credential and password", frontendBaseUrl);
            log.warn("reset emails will contain localhost links until FRONTEND_BASE_URL is set.");
        }
        if (smtpEmailEnabled && (mailUsername.isBlank() || mailPassword.isBlank() || mailFrom.isBlank())) {
            throw new IllegalStateException(
                    "SMTP email is enabled, but MAIL_USERNAME, MAIL_PASSWORD, and MAIL_FROM must all be set.");
        }
        if (!smtpEmailEnabled) {
            log.warn("NOTE: SMTP email is disabled. User credentials and password reset emails will be logged only.");
            log.warn("Set MAIL_ENABLED=true plus MAIL_USERNAME, MAIL_PASSWORD, and MAIL_FROM in production.");
        }
    }
}
