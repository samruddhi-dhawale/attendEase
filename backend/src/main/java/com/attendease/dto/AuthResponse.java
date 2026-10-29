package com.attendease.dto;

import com.attendease.model.Role;

public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private String rollNumber;
    private String department;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String email, String fullName, Role role, String rollNumber, String department) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.rollNumber = rollNumber;
        this.department = department;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
