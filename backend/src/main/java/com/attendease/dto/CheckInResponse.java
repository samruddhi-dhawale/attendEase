package com.attendease.dto;

import com.attendease.model.AttendanceStatus;
import com.attendease.model.VerificationStatus;
import java.time.LocalDateTime;

public class CheckInResponse {
    private boolean success;
    private AttendanceStatus status;
    private VerificationStatus verificationStatus;
    private String message;
    private Double distanceMeters;
    private Double allowedRadiusMeters;
    private LocalDateTime checkInTime;
    private String sessionTitle;
    private String courseCode;

    public CheckInResponse() {}

    public CheckInResponse(boolean success, AttendanceStatus status, VerificationStatus verificationStatus,
                           String message, Double distanceMeters, Double allowedRadiusMeters,
                           LocalDateTime checkInTime, String sessionTitle, String courseCode) {
        this.success = success;
        this.status = status;
        this.verificationStatus = verificationStatus;
        this.message = message;
        this.distanceMeters = distanceMeters;
        this.allowedRadiusMeters = allowedRadiusMeters;
        this.checkInTime = checkInTime;
        this.sessionTitle = sessionTitle;
        this.courseCode = courseCode;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Double getAllowedRadiusMeters() { return allowedRadiusMeters; }
    public void setAllowedRadiusMeters(Double allowedRadiusMeters) { this.allowedRadiusMeters = allowedRadiusMeters; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
}
