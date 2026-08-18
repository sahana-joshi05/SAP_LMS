package com.svlms.controller;

import com.svlms.dto.request.CreateUserRequest;
import com.svlms.dto.response.UserResponse;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Admin can create staff accounts too, but UserService enforces it can't create
    // Super Admin or Admin accounts - only Super Admin can do that.
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
    public UserResponse create(@RequestBody CreateUserRequest request, @AuthenticationPrincipal AuthPrincipal principal) {
        return userService.create(request, principal);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','OPERATIONS')")
    public List<UserResponse> list(@RequestParam(required = false) String role) {
        return userService.list(role);
    }
}
