package com.attendease.service;

import com.attendease.config.JwtTokenProvider;
import com.attendease.dto.AuthRequest;
import com.attendease.dto.AuthResponse;
import com.attendease.dto.RegisterRequest;
import com.attendease.exception.AttendEaseException;
import com.attendease.model.Role;
import com.attendease.model.User;
import com.attendease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new AttendEaseException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AttendEaseException("Invalid email or password");
        }

        if (!user.getActive()) {
            throw new AttendEaseException("Your account has been deactivated. Please contact administration.");
        }

        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getRollNumber(),
                user.getDepartment()
        );
    }

    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new AttendEaseException("An account with this email already exists: " + cleanEmail);
        }

        if (request.getRollNumber() != null && !request.getRollNumber().isBlank()
                && userRepository.existsByRollNumber(request.getRollNumber().trim())) {
            throw new AttendEaseException("Roll / Employee ID is already registered: " + request.getRollNumber());
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_STUDENT;

        User user = new User(
                cleanEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getRollNumber() != null ? request.getRollNumber().trim() : null,
                request.getDepartment() != null ? request.getDepartment().trim() : "Computer Science & Engineering",
                role
        );

        User saved = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(saved);

        return new AuthResponse(
                token,
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole(),
                saved.getRollNumber(),
                saved.getDepartment()
        );
    }
}
