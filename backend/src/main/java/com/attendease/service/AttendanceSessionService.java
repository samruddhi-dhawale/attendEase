package com.attendease.service;

import com.attendease.dto.SessionCreateRequest;
import com.attendease.dto.SessionQrResponse;
import com.attendease.exception.AttendEaseException;
import com.attendease.model.AttendanceSession;
import com.attendease.model.Course;
import com.attendease.model.User;
import com.attendease.repository.AttendanceRecordRepository;
import com.attendease.repository.AttendanceSessionRepository;
import com.attendease.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AttendanceSessionService {

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private QrCodeTokenService qrCodeTokenService;

    @Transactional
    public AttendanceSession createSession(SessionCreateRequest req, User user) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new AttendEaseException("Course not found with ID: " + req.getCourseId()));

        AttendanceSession session = new AttendanceSession(
                course,
                req.getSessionTitle(),
                req.getSessionDate(),
                req.getStartTime(),
                req.getEndTime(),
                req.getVenueName(),
                req.getVenueLatitude(),
                req.getVenueLongitude(),
                req.getGeofenceRadiusMeters(),
                user
        );

        return sessionRepository.save(session);
    }

    public List<AttendanceSession> getAllSessions() {
        return sessionRepository.findAllByOrderBySessionDateDescStartTimeDesc();
    }

    public List<AttendanceSession> getActiveSessions() {
        return sessionRepository.findByActiveTrue();
    }

    public AttendanceSession getSessionById(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new AttendEaseException("Session not found with ID: " + id));
    }

    @Transactional
    public AttendanceSession toggleSessionStatus(Long id, boolean active) {
        AttendanceSession session = getSessionById(id);
        session.setActive(active);
        return sessionRepository.save(session);
    }

    public SessionQrResponse getCurrentDynamicQr(Long sessionId) {
        AttendanceSession session = getSessionById(sessionId);

        // Generate rotating 10-second HMAC token
        String rawToken = qrCodeTokenService.generateTokenForSession(session.getId(), session.getSessionSecretKey());
        long remainingSec = qrCodeTokenService.getRemainingSecondsInCurrentWindow();

        // Package into JSON or structured payload for QR scanner
        // Payload: ATTENDEASE:SESSION_ID:TOKEN
        String qrPayload = "ATTENDEASE:" + rawToken;

        // Render QR Code as PNG Base64 Data URI
        String qrDataUri = qrCodeTokenService.generateQrCodeDataUri(qrPayload, 380, 380);

        long attendeesCount = attendanceRecordRepository.countBySession(session);

        SessionQrResponse res = new SessionQrResponse();
        res.setSessionId(session.getId());
        res.setSessionTitle(session.getSessionTitle());
        res.setCourseCode(session.getCourse().getCourseCode());
        res.setCourseTitle(session.getCourse().getTitle());
        res.setVenueName(session.getVenueName());
        res.setVenueLatitude(session.getVenueLatitude());
        res.setVenueLongitude(session.getVenueLongitude());
        res.setGeofenceRadiusMeters(session.getGeofenceRadiusMeters());
        res.setQrPayload(qrPayload);
        res.setQrCodeDataUri(qrDataUri);
        res.setExpiresInSeconds(remainingSec);
        res.setRotationIntervalSeconds(qrCodeTokenService.getRotationIntervalSeconds());
        res.setServerTimestamp(System.currentTimeMillis());
        res.setActiveAttendeesCount(attendeesCount);

        return res;
    }
}
