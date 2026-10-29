package com.attendease.controller;

import com.attendease.dto.SessionCreateRequest;
import com.attendease.dto.SessionQrResponse;
import com.attendease.model.AttendanceSession;
import com.attendease.model.User;
import com.attendease.service.AttendanceSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class AttendanceSessionController {

    @Autowired
    private AttendanceSessionService sessionService;

    @GetMapping
    public ResponseEntity<List<AttendanceSession>> getAllSessions(@RequestParam(required = false) Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(sessionService.getActiveSessions());
        }
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceSession> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PostMapping
    public ResponseEntity<AttendanceSession> createSession(@Valid @RequestBody SessionCreateRequest request,
                                                           @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(sessionService.createSession(request, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AttendanceSession> toggleStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean active = body.getOrDefault("active", true);
        return ResponseEntity.ok(sessionService.toggleSessionStatus(id, active));
    }

    /**
     * Poll / fetch live dynamic QR code for faculty projector screen.
     * Code rotates every 10 seconds with HMAC signature and remaining countdown.
     */
    @GetMapping("/{id}/live-qr")
    public ResponseEntity<SessionQrResponse> getLiveQr(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getCurrentDynamicQr(id));
    }
}
