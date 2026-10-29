package com.attendease.model;

public enum VerificationStatus {
    VERIFIED,
    FAILED_GEOFENCE,
    FAILED_DEVICE_PROXY,
    EXPIRED_QR,
    DUPLICATE_CHECKIN
}
