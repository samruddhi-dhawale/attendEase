package com.attendease.exception;

public class AttendEaseException extends RuntimeException {
    public AttendEaseException(String message) {
        super(message);
    }

    public AttendEaseException(String message, Throwable cause) {
        super(message, cause);
    }
}
