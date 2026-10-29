package com.attendease.service;

import com.attendease.dto.AttendanceAnalyticsDto;
import com.attendease.dto.CheckInRequest;
import com.attendease.dto.CheckInResponse;
import com.attendease.exception.AttendEaseException;
import com.attendease.model.*;
import com.attendease.repository.AttendanceRecordRepository;
import com.attendease.repository.AttendanceSessionRepository;
import com.attendease.repository.CourseRepository;
import com.attendease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private GeolocationService geolocationService;

    @Autowired
    private QrCodeTokenService qrCodeTokenService;

    @Autowired
    private DeviceFingerprintService deviceFingerprintService;

    @Value("${attendease.security.late-threshold-minutes:15}")
    private int lateThresholdMinutes;

    @Value("${attendease.security.enforce-geofence:true}")
    private boolean enforceGeofence;

    @Transactional
    public CheckInResponse processStudentCheckIn(User student, CheckInRequest request, String clientIp, String userAgent) {
        AttendanceSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new AttendEaseException("Attendance session not found with ID: " + request.getSessionId()));

        if (!session.getActive()) {
            throw new AttendEaseException("This attendance session has already ended or is closed.");
        }

        // 1. DUPLICATE CHECK: Verify if student already marked attendance for this session
        Optional<AttendanceRecord> existing = attendanceRecordRepository.findBySessionAndStudent(session, student);
        if (existing.isPresent()) {
            AttendanceRecord record = existing.get();
            return new CheckInResponse(
                    false,
                    record.getStatus(),
                    VerificationStatus.DUPLICATE_CHECKIN,
                    "Duplicate Attendance Detected: You have already marked attendance for this session at "
                            + record.getCheckInTime().toLocalTime().toString().substring(0, 5) + ".",
                    record.getDistanceFromVenueMeters(),
                    session.getGeofenceRadiusMeters(),
                    record.getCheckInTime(),
                    session.getSessionTitle(),
                    session.getCourse().getCourseCode()
            );
        }

        // 2. ANTI-PROXY STEP 1: 10-Second Dynamic QR Code Verification
        boolean isTokenValid = qrCodeTokenService.validateToken(session.getId(), request.getQrToken(), session.getSessionSecretKey());
        if (!isTokenValid) {
            throw new AttendEaseException("QR Code Expired or Invalid! The code refreshes every 10 seconds. Please scan directly from the active screen.");
        }

        // 3. DEVICE FINGERPRINTING & HARDWARE PROXY AUDIT
        String hashedDevice = deviceFingerprintService.hashFingerprint(request.getDeviceFingerprint(), userAgent);
        Optional<AttendanceRecord> conflict = deviceFingerprintService.detectDeviceProxyConflict(session, student, hashedDevice);
        if (conflict.isPresent()) {
            User originalStudent = conflict.get().getStudent();
            AttendanceRecord proxyViolation = new AttendanceRecord(
                    session, student, AttendanceStatus.PROXY_BLOCKED, VerificationStatus.FAILED_DEVICE_PROXY,
                    request.getLatitude(), request.getLongitude(), null, hashedDevice, clientIp, userAgent,
                    "Blocked: Device already used in this session by " + originalStudent.getFullName() + " (" + originalStudent.getRollNumber() + ")"
            );
            attendanceRecordRepository.save(proxyViolation);

            return new CheckInResponse(
                    false,
                    AttendanceStatus.PROXY_BLOCKED,
                    VerificationStatus.FAILED_DEVICE_PROXY,
                    "Proxy Attendance Blocked: This physical device was already used by another student ("
                            + originalStudent.getFullName() + ") for this session. One device per student is strictly enforced.",
                    null,
                    session.getGeofenceRadiusMeters(),
                    LocalDateTime.now(),
                    session.getSessionTitle(),
                    session.getCourse().getCourseCode()
            );
        }

        // 4. ANTI-PROXY STEP 2: Geolocation & Geofence Perimeter Verification
        double distanceMeters = geolocationService.calculateDistanceMeters(
                session.getVenueLatitude(), session.getVenueLongitude(),
                request.getLatitude(), request.getLongitude()
        );

        boolean insideGeofence = !enforceGeofence || distanceMeters <= session.getGeofenceRadiusMeters();
        if (!insideGeofence) {
            AttendanceRecord geofenceViolation = new AttendanceRecord(
                    session, student, AttendanceStatus.PROXY_BLOCKED, VerificationStatus.FAILED_GEOFENCE,
                    request.getLatitude(), request.getLongitude(), distanceMeters, hashedDevice, clientIp, userAgent,
                    String.format("Blocked: Outside venue perimeter. Detected at %.1fm, radius is %.1fm",
                            distanceMeters, session.getGeofenceRadiusMeters())
            );
            attendanceRecordRepository.save(geofenceViolation);

            return new CheckInResponse(
                    false,
                    AttendanceStatus.PROXY_BLOCKED,
                    VerificationStatus.FAILED_GEOFENCE,
                    String.format("Location Verification Failed: You are %.1fm away from the classroom venue (%s). Allowed radius is %.0fm. You must be physically inside the class.",
                            distanceMeters, session.getVenueName(), session.getGeofenceRadiusMeters()),
                    distanceMeters,
                    session.getGeofenceRadiusMeters(),
                    LocalDateTime.now(),
                    session.getSessionTitle(),
                    session.getCourse().getCourseCode()
            );
        }

        // 5. PUNCTUALITY EVALUATION: Determine PRESENT vs LATE
        LocalTime now = LocalTime.now();
        LocalTime lateCutoff = session.getStartTime().plusMinutes(lateThresholdMinutes);
        AttendanceStatus status = now.isAfter(lateCutoff) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

        String remarks = (status == AttendanceStatus.LATE)
                ? "Checked in after " + lateThresholdMinutes + " mins grace period"
                : "On time verification";

        AttendanceRecord record = new AttendanceRecord(
                session, student, status, VerificationStatus.VERIFIED,
                request.getLatitude(), request.getLongitude(), distanceMeters,
                hashedDevice, clientIp, userAgent, remarks
        );

        AttendanceRecord saved = attendanceRecordRepository.save(record);

        return new CheckInResponse(
                true,
                status,
                VerificationStatus.VERIFIED,
                status == AttendanceStatus.PRESENT
                        ? "Attendance verified successfully! Welcome to " + session.getCourse().getCourseCode() + "."
                        : "Attendance marked as LATE. You checked in after the " + lateThresholdMinutes + "-minute grace window.",
                distanceMeters,
                session.getGeofenceRadiusMeters(),
                saved.getCheckInTime(),
                session.getSessionTitle(),
                session.getCourse().getCourseCode()
        );
    }

    public List<AttendanceRecord> getSessionRecords(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AttendEaseException("Session not found: " + sessionId));
        return attendanceRecordRepository.findBySessionOrderByCheckInTimeDesc(session);
    }

    public List<AttendanceRecord> getStudentRecords(User student) {
        return attendanceRecordRepository.findByStudentOrderByCheckInTimeDesc(student);
    }

    @Transactional
    public AttendanceRecord overrideAttendance(Long recordId, AttendanceStatus newStatus, String remarks, User adminUser) {
        AttendanceRecord record = attendanceRecordRepository.findById(recordId)
                .orElseThrow(() -> new AttendEaseException("Attendance record not found: " + recordId));

        record.setStatus(newStatus);
        record.setManualOverride(true);
        record.setMarkedBy(adminUser);
        if (remarks != null && !remarks.isBlank()) {
            record.setRemarks("Admin override by " + adminUser.getFullName() + ": " + remarks);
        }
        return attendanceRecordRepository.save(record);
    }

    public AttendanceAnalyticsDto getOverallAnalytics() {
        AttendanceAnalyticsDto dto = new AttendanceAnalyticsDto();
        long totalSessions = sessionRepository.count();
        long totalStudents = userRepository.findByRole(Role.ROLE_STUDENT).size();
        List<AttendanceRecord> allRecords = attendanceRecordRepository.findAll();

        long present = allRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long late = allRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long blocked = allRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PROXY_BLOCKED).count();
        long totalValid = present + late;

        dto.setTotalSessions(totalSessions);
        dto.setTotalStudents(totalStudents);
        dto.setTotalRecords(allRecords.size());
        dto.setTotalPresent(present);
        dto.setTotalLate(late);
        dto.setTotalProxyBlocked(blocked);

        double rate = (totalSessions > 0 && totalStudents > 0)
                ? (double) totalValid / (totalSessions * Math.max(1, totalStudents)) * 100.0
                : (allRecords.size() > 0 ? (double) totalValid / allRecords.size() * 100.0 : 0.0);
        dto.setOverallAttendanceRate(Math.min(100.0, Math.round(rate * 10.0) / 10.0));

        double punctuality = totalValid > 0 ? ((double) present / totalValid) * 100.0 : 0.0;
        dto.setPunctualityRate(Math.round(punctuality * 10.0) / 10.0);

        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("PRESENT", present);
        breakdown.put("LATE", late);
        breakdown.put("PROXY_BLOCKED", blocked);
        dto.setStatusBreakdown(breakdown);

        return dto;
    }
}
