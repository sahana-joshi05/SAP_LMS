package com.svlms.security;

import com.svlms.exception.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Defense-in-depth against credential-stuffing / brute-force login attempts, keyed by
 * email address. This is intentionally simple: an in-memory sliding window, no external
 * dependencies, good enough for a single-instance deployment.
 *
 * IMPORTANT LIMITATIONS to be aware of before you scale:
 *  - This state is per-JVM-instance. If you ever run more than one backend instance
 *    behind a load balancer, each instance tracks attempts independently, which weakens
 *    the protection. At that point, move this to Redis (or similar shared store) instead.
 *  - This only limits by email, not by IP, so it won't stop someone hammering many
 *    different email addresses from one source. The nginx config in nginx/conf.d/ adds
 *    a complementary IP-based limit at the reverse-proxy layer for that reason - the two
 *    work together, not as substitutes for each other.
 */
@Component
public class LoginRateLimiter {

    private final int maxAttempts;
    private final Duration window;
    private final ConcurrentHashMap<String, Deque<Instant>> attemptsByEmail = new ConcurrentHashMap<>();

    public LoginRateLimiter(
            @Value("${app.login-rate-limit.max-attempts:5}") int maxAttempts,
            @Value("${app.login-rate-limit.window-minutes:15}") int windowMinutes) {
        this.maxAttempts = maxAttempts;
        this.window = Duration.ofMinutes(windowMinutes);
    }

    /** Call before attempting authentication. Throws if this email has too many recent failures. */
    public void checkAllowed(String email) {
        Deque<Instant> attempts = attemptsByEmail.computeIfAbsent(normalize(email), k -> new ConcurrentLinkedDeque<>());
        prune(attempts);
        if (attempts.size() >= maxAttempts) {
            throw new TooManyRequestsException(
                "Too many failed login attempts for this account. Try again in a few minutes.");
        }
    }

    /** Call after a failed login attempt. */
    public void recordFailure(String email) {
        Deque<Instant> attempts = attemptsByEmail.computeIfAbsent(normalize(email), k -> new ConcurrentLinkedDeque<>());
        attempts.addLast(Instant.now());
        prune(attempts);
    }

    /** Call after a successful login to clear this email's failure history. */
    public void recordSuccess(String email) {
        attemptsByEmail.remove(normalize(email));
    }

    private void prune(Deque<Instant> attempts) {
        Instant cutoff = Instant.now().minus(window);
        while (!attempts.isEmpty() && attempts.peekFirst().isBefore(cutoff)) {
            attempts.pollFirst();
        }
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
