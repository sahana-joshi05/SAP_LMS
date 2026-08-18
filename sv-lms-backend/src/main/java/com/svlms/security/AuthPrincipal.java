package com.svlms.security;

public class AuthPrincipal {
    private final Long id;
    private final String email;
    private final String role; // e.g. SUPERADMIN, COUNSELOR
    private final String name;

    public AuthPrincipal(Long id, String email, String role, String name) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.name = name;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getName() { return name; }
}
