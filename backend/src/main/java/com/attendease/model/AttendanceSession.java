package com.attendease.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 150)
    private String sessionTitle;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 100)
    private String venueName;

    @Column(nullable = false)
    private Double venueLatitude;

    @Column(nullable = false)
    private Double venueLongitude;

    @Column(nullable = false)
    private Double geofenceRadiusMeters = 100.0; // default 100 meters

    @Column(nullable = false, length = 64)
    private String sessionSecretKey;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public AttendanceSession() {
        this.sessionSecretKey = UUID.randomUUID().toString().replace("-", "");
    }

    public AttendanceSession(Course course, String sessionTitle, LocalDate sessionDate,
                             LocalTime startTime, LocalTime endTime, String venueName,
                             Double venueLatitude, Double venueLongitude, Double geofenceRadiusMeters,
                             User createdBy) {
        this.course = course;
        this.sessionTitle = sessionTitle;
        this.sessionDate = sessionDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.venueName = venueName;
        this.venueLatitude = venueLatitude;
        this.venueLongitude = venueLongitude;
        this.geofenceRadiusMeters = geofenceRadiusMeters != null ? geofenceRadiusMeters : 100.0;
        this.createdBy = createdBy;
        this.sessionSecretKey = UUID.randomUUID().toString().replace("-", "");
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public Double getVenueLatitude() { return venueLatitude; }
    public void setVenueLatitude(Double venueLatitude) { this.venueLatitude = venueLatitude; }

    public Double getVenueLongitude() { return venueLongitude; }
    public void setVenueLongitude(Double venueLongitude) { this.venueLongitude = venueLongitude; }

    public Double getGeofenceRadiusMeters() { return geofenceRadiusMeters; }
    public void setGeofenceRadiusMeters(Double geofenceRadiusMeters) { this.geofenceRadiusMeters = geofenceRadiusMeters; }

    public String getSessionSecretKey() { return sessionSecretKey; }
    public void setSessionSecretKey(String sessionSecretKey) { this.sessionSecretKey = sessionSecretKey; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
