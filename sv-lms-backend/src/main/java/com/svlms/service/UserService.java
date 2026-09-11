package com.svlms.service;

import com.svlms.dto.request.CreateUserRequest;
import com.svlms.dto.response.UserResponse;
import com.svlms.entity.Student;
import com.svlms.entity.User;
import com.svlms.exception.BadRequestException;
import com.svlms.exception.ConflictException;
import com.svlms.exception.ForbiddenException;
import com.svlms.exception.ResourceNotFoundException;
import com.svlms.repository.PasswordResetTokenRepository;
import com.svlms.repository.StudentRepository;
import com.svlms.repository.UserRepository;
import com.svlms.security.AuthPrincipal;
import com.svlms.service.email.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.email.fail-user-create-on-send-error:false}")
    private boolean failUserCreateOnEmailError;

    public UserService(UserRepository userRepository, StudentRepository studentRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
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

        // Admin has limited administrative access: it can create staff accounts only.
        // Super Admin is the credential owner for all roles, including Admin and Student.
        if ("ADMIN".equals(requester.getRole())
                && (role == User.Role.SUPERADMIN || role == User.Role.ADMIN || role == User.Role.STUDENT)) {
            throw new ForbiddenException("Admin cannot create Super Admin, Admin, or Student accounts");
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

        if (role == User.Role.STUDENT) {
            Student student = new Student();
            student.setUser(user);
            studentRepository.save(student);
        }

        try {
            sendNewUserCredentials(user, request.getPassword());
        } catch (RuntimeException e) {
            log.error("User {} was created, but credential email could not be sent to {}",
                    user.getId(), user.getEmail(), e);
            if (failUserCreateOnEmailError) {
                throw new IllegalStateException("Credential email could not be sent. Please check mail configuration.", e);
            }
        }

        return toResponse(user);
    }

    public List<UserResponse> list(String roleFilter) {
        List<User> users = (roleFilter != null)
                ? userRepository.findByRole(User.Role.valueOf(roleFilter.toUpperCase()))
                : userRepository.findAll();

        return users.stream().map(this::toResponse).toList();
    }

    @Transactional
    public UserResponse update(Long id, CreateUserRequest request, AuthPrincipal requester) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() == null || request.getEmail() == null || request.getRole() == null) {
            throw new BadRequestException("name, email, role are required");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role");
        }

        if (user.getRole() == User.Role.SUPERADMIN && role != User.Role.SUPERADMIN) {
            throw new ForbiddenException("Super Admin role cannot be changed");
        }
        if ("ADMIN".equals(requester.getRole())
                && (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.STUDENT
                || role == User.Role.ADMIN || role == User.Role.STUDENT || role == User.Role.SUPERADMIN)) {
            throw new ForbiddenException("Admin cannot update Admin, Student, or Super Admin accounts");
        }

        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ConflictException("A user with this email already exists");
            }
        });

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(role);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        userRepository.save(user);

        if (role == User.Role.STUDENT && studentRepository.findByUser(user).isEmpty()) {
            Student student = new Student();
            student.setUser(user);
            studentRepository.save(student);
        } else if (role != User.Role.STUDENT) {
            try {
                studentRepository.findByUser(user).ifPresent(studentRepository::delete);
                studentRepository.flush();
            } catch (DataIntegrityViolationException e) {
                throw new BadRequestException("This user has student records, so role cannot be changed from student");
            }
        }

        return toResponse(user);
    }

    @Transactional
    public void delete(Long id, AuthPrincipal requester) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getId().equals(requester.getId())) {
            throw new BadRequestException("You cannot delete your own account");
        }
        if (user.getRole() == User.Role.SUPERADMIN) {
            throw new ForbiddenException("Super Admin accounts cannot be deleted");
        }
        if ("ADMIN".equals(requester.getRole())
                && (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.STUDENT)) {
            throw new ForbiddenException("Admin cannot delete Admin or Student accounts");
        }

        try {
            passwordResetTokenRepository.deleteByUser(user);
            studentRepository.findByUser(user).ifPresent(studentRepository::delete);
            userRepository.delete(user);
            userRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("This user is linked to LMS records and cannot be deleted");
        }
    }

    private UserResponse toResponse(User u) {
        UserResponse dto = new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().name().toLowerCase());
        dto.setPhone(u.getPhone() != null ? u.getPhone() : "");
        dto.setStatus(u.getStatus().name().toLowerCase());
        dto.setCreatedAt(u.getCreatedAt().toString());
        return dto;
    }

    private void sendNewUserCredentials(User user, String rawPassword) {
        String loginUrl = frontendBaseUrl + "/login";
        String role = user.getRole().name().toLowerCase();
        String body = """
                Hello %s,

                Your SV LMS account has been created.

                Login URL: %s
                Email: %s
                Password: %s
                Role: %s

                Please sign in and change your password after your first login if required.

                Regards,
                SV Curiotech
                """.formatted(user.getName(), loginUrl, user.getEmail(), rawPassword, role);

        emailService.send(user.getEmail(), "Your SV LMS login credentials", body);
    }
}
