package com.attendease.controller;

import com.attendease.dto.AttendanceAnalyticsDto;
import com.attendease.dto.CheckInRequest;
import com.attendease.dto.CheckInResponse;
import com.attendease.model.AttendanceRecord;
import com.attendease.model.AttendanceStatus;
import com.attendease.model.User;
import com.attendease.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AttendanceRecordController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/attendance/check-in")
    public ResponseEntity<CheckInResponse> checkIn(@Valid @RequestBody CheckInRequest request,
                                                   @AuthenticationPrincipal User student,
                                                   HttpServletRequest servletRequest) {
        String clientIp = servletRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = servletRequest.getRemoteAddr();
        }
        String userAgent = servletRequest.getHeader("User-Agent");

        CheckInResponse response = attendanceService.processStudentCheckIn(student, request, clientIp, userAgent);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/attendance/session/{sessionId}")
    public ResponseEntity<List<AttendanceRecord>> getSessionRecords(@PathVariable Long sessionId) {
        return ResponseEntity.ok(attendanceService.getSessionRecords(sessionId));
    }

    @GetMapping("/attendance/my-history")
    public ResponseEntity<List<AttendanceRecord>> getMyAttendanceHistory(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(attendanceService.getStudentRecords(student));
    }

    @PatchMapping("/attendance/{recordId}/override")
    public ResponseEntity<AttendanceRecord> overrideAttendance(@PathVariable Long recordId,
                                                               @RequestBody Map<String, String> body,
                                                               @AuthenticationPrincipal User adminUser) {
        String statusStr = body.get("status");
        String remarks = body.get("remarks");
        AttendanceStatus newStatus = AttendanceStatus.valueOf(statusStr.toUpperCase());

        return ResponseEntity.ok(attendanceService.overrideAttendance(recordId, newStatus, remarks, adminUser));
    }

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<AttendanceAnalyticsDto> getDashboardAnalytics() {
        return ResponseEntity.ok(attendanceService.getOverallAnalytics());
    }
}
