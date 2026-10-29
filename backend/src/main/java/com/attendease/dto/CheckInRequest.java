package com.attendease.dto;

import jakarta.validation.constraints.NotNull;

public class CheckInRequest {
    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotNull(message = "QR Token is required")
    private String qrToken;

    @NotNull(message = "Latitude is required for geofence validation")
    private Double latitude;

    @NotNull(message = "Longitude is required for geofence validation")
    private Double longitude;

    private Double accuracy;

    private String deviceFingerprint;

    public CheckInRequest() {}

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getQrToken() { return qrToken; }
    public void setQrToken(String qrToken) { this.qrToken = qrToken; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getAccuracy() { return accuracy; }
    public void setAccuracy(Double accuracy) { this.accuracy = accuracy; }

    public String getDeviceFingerprint() { return deviceFingerprint; }
    public void setDeviceFingerprint(String deviceFingerprint) { this.deviceFingerprint = deviceFingerprint; }
}
