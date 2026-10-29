package com.attendease.service;

import com.attendease.model.AttendanceRecord;
import com.attendease.model.AttendanceSession;
import com.attendease.model.User;
import com.attendease.repository.AttendanceRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

/**
 * Service to identify device sharing proxies and enforce one-device-per-student-per-session rule.
 */
@Service
public class DeviceFingerprintService {

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Value("${attendease.security.enforce-device-fingerprint:true}")
    private boolean enforceDeviceFingerprint;

    /**
     * Computes a standardized SHA-256 fingerprint from client data and headers.
     */
    public String hashFingerprint(String rawClientFingerprint, String userAgent) {
        try {
            String combined = (rawClientFingerprint != null ? rawClientFingerprint : "unknown-device")
                    + "|" + (userAgent != null ? userAgent : "unknown-agent");
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(combined.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "hash-fallback-" + (rawClientFingerprint != null ? rawClientFingerprint.hashCode() : 0);
        }
    }

    /**
     * Checks if this device has already been used by a different student in the current session.
     *
     * @return Optional containing previous conflicting record if proxy detected, or empty if valid.
     */
    public Optional<AttendanceRecord> detectDeviceProxyConflict(AttendanceSession session,
                                                                 User currentStudent,
                                                                 String deviceFingerprintHash) {
        if (!enforceDeviceFingerprint || deviceFingerprintHash == null || deviceFingerprintHash.isBlank()) {
            return Optional.empty();
        }

        Optional<AttendanceRecord> previousRecord = attendanceRecordRepository
                .findFirstBySessionAndDeviceFingerprintHash(session, deviceFingerprintHash);

        if (previousRecord.isPresent()) {
            User originalUser = previousRecord.get().getStudent();
            if (!originalUser.getId().equals(currentStudent.getId())) {
                return previousRecord; // Conflict found: Different student on same device!
            }
        }

        return Optional.empty();
    }
}
