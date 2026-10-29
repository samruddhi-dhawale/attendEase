package com.attendease.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "student_id"})
})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private LocalDateTime checkInTime = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VerificationStatus verificationStatus;

    @Column
    private Double studentLatitude;

    @Column
    private Double studentLongitude;

    @Column
    private Double distanceFromVenueMeters;

    @Column(length = 128)
    private String deviceFingerprintHash;

    @Column(length = 64)
    private String clientIpAddress;

    @Column(length = 255)
    private String userAgent;

    @Column(length = 500)
    private String remarks;

    @Column
    private Boolean manualOverride = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marked_by_user_id")
    private User markedBy;

    public AttendanceRecord() {}

    public AttendanceRecord(AttendanceSession session, User student, AttendanceStatus status,
                            VerificationStatus verificationStatus, Double studentLatitude,
                            Double studentLongitude, Double distanceFromVenueMeters,
                            String deviceFingerprintHash, String clientIpAddress,
                            String userAgent, String remarks) {
        this.session = session;
        this.student = student;
        this.checkInTime = LocalDateTime.now();
        this.status = status;
        this.verificationStatus = verificationStatus;
        this.studentLatitude = studentLatitude;
        this.studentLongitude = studentLongitude;
        this.distanceFromVenueMeters = distanceFromVenueMeters;
        this.deviceFingerprintHash = deviceFingerprintHash;
        this.clientIpAddress = clientIpAddress;
        this.userAgent = userAgent;
        this.remarks = remarks;
        this.manualOverride = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AttendanceSession getSession() { return session; }
    public void setSession(AttendanceSession session) { this.session = session; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public Double getStudentLatitude() { return studentLatitude; }
    public void setStudentLatitude(Double studentLatitude) { this.studentLatitude = studentLatitude; }

    public Double getStudentLongitude() { return studentLongitude; }
    public void setStudentLongitude(Double studentLongitude) { this.studentLongitude = studentLongitude; }

    public Double getDistanceFromVenueMeters() { return distanceFromVenueMeters; }
    public void setDistanceFromVenueMeters(Double distanceFromVenueMeters) { this.distanceFromVenueMeters = distanceFromVenueMeters; }

    public String getDeviceFingerprintHash() { return deviceFingerprintHash; }
    public void setDeviceFingerprintHash(String deviceFingerprintHash) { this.deviceFingerprintHash = deviceFingerprintHash; }

    public String getClientIpAddress() { return clientIpAddress; }
    public void setClientIpAddress(String clientIpAddress) { this.clientIpAddress = clientIpAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Boolean getManualOverride() { return manualOverride; }
    public void setManualOverride(Boolean manualOverride) { this.manualOverride = manualOverride; }

    public User getMarkedBy() { return markedBy; }
    public void setMarkedBy(User markedBy) { this.markedBy = markedBy; }
}
