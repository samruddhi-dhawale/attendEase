package com.attendease.service;

import org.springframework.stereotype.Service;

/**
 * High-precision Geolocation and Geofencing Service using the Haversine formula.
 * Computes exact spherical distance between venue coordinates and student device GPS.
 */
@Service
public class GeolocationService {

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    /**
     * Calculates the great-circle distance between two points on Earth using Haversine formula.
     *
     * @param lat1 Venue latitude
     * @param lon1 Venue longitude
     * @param lat2 Student device latitude
     * @param lon2 Student device longitude
     * @return Distance in meters rounded to two decimal places
     */
    public double calculateDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
                + Math.cos(rLat1) * Math.cos(rLat2)
                * Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        double distance = EARTH_RADIUS_METERS * c;

        return Math.round(distance * 100.0) / 100.0;
    }

    /**
     * Checks if the student is strictly within the allowed venue geofence perimeter.
     *
     * @param venueLat Venue latitude
     * @param venueLon Venue longitude
     * @param studentLat Student latitude
     * @param studentLon Student longitude
     * @param allowedRadiusMeters Allowed circular radius around venue
     * @return true if distance <= allowedRadiusMeters
     */
    public boolean isWithinGeofence(double venueLat, double venueLon,
                                    double studentLat, double studentLon,
                                    double allowedRadiusMeters) {
        double distance = calculateDistanceMeters(venueLat, venueLon, studentLat, studentLon);
        return distance <= allowedRadiusMeters;
    }
}
