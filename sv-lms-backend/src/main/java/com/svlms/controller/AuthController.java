package com.svlms.controller;

import com.svlms.dto.request.ForgotPasswordRequest;
import com.svlms.dto.request.LoginRequest;
import com.svlms.dto.request.ResetPasswordRequest;
import com.svlms.dto.response.AuthResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.AuthService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal AuthPrincipal principal) {
        return Map.of("user", Map.of(
            "id", principal.getId(),
            "name", principal.getName(),
            "email", principal.getEmail(),
            "role", principal.getRole().toLowerCase()
        ));
    }
}
