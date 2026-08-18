package com.svlms.service;

import com.svlms.dto.request.ForgotPasswordRequest;
import com.svlms.dto.request.LoginRequest;
import com.svlms.dto.request.ResetPasswordRequest;
import com.svlms.dto.response.AuthResponse;
import com.svlms.dto.response.UserResponse;
import com.svlms.entity.PasswordResetToken;
import com.svlms.entity.User;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.UnauthorizedException;
import com.svlms.repository.PasswordResetTokenRepository;
import com.svlms.repository.UserRepository;
import com.svlms.security.JwtUtil;
import com.svlms.security.LoginRateLimiter;
import com.svlms.service.email.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginRateLimiter loginRateLimiter;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    private static final int RESET_TOKEN_VALID_MINUTES = 30;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                        LoginRateLimiter loginRateLimiter, PasswordResetTokenRepository passwordResetTokenRepository,
                        EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.loginRateLimiter = loginRateLimiter;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password required");
        }

        loginRateLimiter.checkAllowed(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    loginRateLimiter.recordFailure(request.getEmail());
                    throw new UnauthorizedException("Invalid credentials");
                });

        if (user.getStatus() != User.Status.ACTIVE) {
            throw new UnauthorizedException("Account is inactive");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            loginRateLimiter.recordFailure(request.getEmail());
            throw new UnauthorizedException("Invalid credentials");
        }

        loginRateLimiter.recordSuccess(request.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getName());
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole().name().toLowerCase());

        return new AuthResponse(token, userResponse);
    }

    /**
     * Always returns the same generic response whether or not the email exists, to
     * avoid leaking which emails have accounts (a common enumeration attack vector).
     */
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }

        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES));
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken.getToken();
            emailService.send(
                user.getEmail(),
                "Reset your SV LMS password",
                "Click here to reset your password (expires in " + RESET_TOKEN_VALID_MINUTES + " minutes): " + resetLink
            );
        });

        return Map.of("message", "If an account exists for that email, a password reset link has been sent.");
    }

    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new BadRequestException("A valid token and a new password (at least 8 characters) are required");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("This reset link is invalid."));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This reset link has already been used. Request a new one.");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link has expired. Request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        loginRateLimiter.recordSuccess(user.getEmail()); // clear any lockout now that password is known-good

        return Map.of("message", "Password updated. You can now log in with your new password.");
    }
}
