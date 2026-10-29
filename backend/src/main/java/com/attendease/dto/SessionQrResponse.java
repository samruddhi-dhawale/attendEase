package com.attendease.dto;

public class SessionQrResponse {
    private Long sessionId;
    private String sessionTitle;
    private String courseCode;
    private String courseTitle;
    private String venueName;
    private Double venueLatitude;
    private Double venueLongitude;
    private Double geofenceRadiusMeters;
    private String qrPayload;       // raw string encoded in QR
    private String qrCodeDataUri;    // data:image/png;base64,...
    private long expiresInSeconds;
    private int rotationIntervalSeconds;
    private long serverTimestamp;
    private long activeAttendeesCount;

    public SessionQrResponse() {}

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public Double getVenueLatitude() { return venueLatitude; }
    public void setVenueLatitude(Double venueLatitude) { this.venueLatitude = venueLatitude; }

    public Double getVenueLongitude() { return venueLongitude; }
    public void setVenueLongitude(Double venueLongitude) { this.venueLongitude = venueLongitude; }

    public Double getGeofenceRadiusMeters() { return geofenceRadiusMeters; }
    public void setGeofenceRadiusMeters(Double geofenceRadiusMeters) { this.geofenceRadiusMeters = geofenceRadiusMeters; }

    public String getQrPayload() { return qrPayload; }
    public void setQrPayload(String qrPayload) { this.qrPayload = qrPayload; }

    public String getQrCodeDataUri() { return qrCodeDataUri; }
    public void setQrCodeDataUri(String qrCodeDataUri) { this.qrCodeDataUri = qrCodeDataUri; }

    public long getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(long expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }

    public int getRotationIntervalSeconds() { return rotationIntervalSeconds; }
    public void setRotationIntervalSeconds(int rotationIntervalSeconds) { this.rotationIntervalSeconds = rotationIntervalSeconds; }

    public long getServerTimestamp() { return serverTimestamp; }
    public void setServerTimestamp(long serverTimestamp) { this.serverTimestamp = serverTimestamp; }

    public long getActiveAttendeesCount() { return activeAttendeesCount; }
    public void setActiveAttendeesCount(long activeAttendeesCount) { this.activeAttendeesCount = activeAttendeesCount; }
}
