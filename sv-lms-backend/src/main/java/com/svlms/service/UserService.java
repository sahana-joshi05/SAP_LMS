package com.svlms.service;

import com.svlms.dto.request.CreateUserRequest;
import com.svlms.dto.response.UserResponse;
import com.svlms.entity.User;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ConflictException;
import com.svlms.exception.ForbiddenException;
import com.svlms.repository.UserRepository;
import com.svlms.security.AuthPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse create(CreateUserRequest request, AuthPrincipal requester) {
        if (request.getName() == null || request.getEmail() == null
                || request.getPassword() == null || request.getRole() == null) {
            throw new BadRequestException("name, email, password, role are required");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role");
        }

        // Admin has limited administrative access: it can create operational staff
        // accounts but not Super Admin or other Admin accounts - only Super Admin can.
        if ("ADMIN".equals(requester.getRole()) && (role == User.Role.SUPERADMIN || role == User.Role.ADMIN)) {
            throw new ForbiddenException("Admin cannot create Super Admin or Admin accounts");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("A user with this email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        userRepository.save(user);

        return toResponse(user);
    }

    public List<UserResponse> list(String roleFilter) {
        List<User> users = (roleFilter != null)
                ? userRepository.findByRole(User.Role.valueOf(roleFilter.toUpperCase()))
                : userRepository.findAll();

        return users.stream().map(this::toResponse).toList();
    }

    private UserResponse toResponse(User u) {
        UserResponse dto = new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().name().toLowerCase());
        dto.setPhone(u.getPhone() != null ? u.getPhone() : "");
        dto.setStatus(u.getStatus().name().toLowerCase());
        dto.setCreatedAt(u.getCreatedAt().toString());
        return dto;
    }
}
