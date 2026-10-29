package com.attendease.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class SessionCreateRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotBlank(message = "Session title is required")
    private String sessionTitle;

    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Venue name is required")
    private String venueName;

    @NotNull(message = "Venue latitude is required")
    private Double venueLatitude;

    @NotNull(message = "Venue longitude is required")
    private Double venueLongitude;

    private Double geofenceRadiusMeters = 100.0;

    public SessionCreateRequest() {}

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

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
}
