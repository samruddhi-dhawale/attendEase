-- ==========================================================
-- AttendEase: Smart Attendance Management Database Schema
-- Compatible with MySQL 8.0+ and MariaDB
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `attendeasedb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `attendeasedb`;

-- 1. Users Table (Role-Based: ADMIN, FACULTY, STUDENT)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `roll_number` VARCHAR(50) UNIQUE,
    `department` VARCHAR(100) DEFAULT 'Computer Science & Engineering',
    `role` VARCHAR(20) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS `courses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(20) NOT NULL UNIQUE,
    `title` VARCHAR(150) NOT NULL,
    `department` VARCHAR(100),
    `instructor_id` BIGINT,
    `description` TEXT,
    `semester` VARCHAR(30) DEFAULT 'Fall 2026',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_course_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Attendance Sessions Table
CREATE TABLE IF NOT EXISTS `attendance_sessions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `course_id` BIGINT NOT NULL,
    `session_title` VARCHAR(150) NOT NULL,
    `session_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `venue_name` VARCHAR(100) NOT NULL,
    `venue_latitude` DOUBLE NOT NULL,
    `venue_longitude` DOUBLE NOT NULL,
    `geofence_radius_meters` DOUBLE NOT NULL DEFAULT 100.0,
    `session_secret_key` VARCHAR(64) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_by_user_id` BIGINT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_session_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_session_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Attendance Records Table (Anti-Proxy & Audit Trail)
CREATE TABLE IF NOT EXISTS `attendance_records` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `session_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `check_in_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) NOT NULL,
    `verification_status` VARCHAR(30) NOT NULL,
    `student_latitude` DOUBLE,
    `student_longitude` DOUBLE,
    `distance_from_venue_meters` DOUBLE,
    `device_fingerprint_hash` VARCHAR(128),
    `client_ip_address` VARCHAR(64),
    `user_agent` VARCHAR(255),
    `remarks` VARCHAR(500),
    `manual_override` BOOLEAN DEFAULT FALSE,
    `marked_by_user_id` BIGINT,
    CONSTRAINT `uq_session_student` UNIQUE (`session_id`, `student_id`),
    CONSTRAINT `fk_record_session` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_record_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_record_override_by` FOREIGN KEY (`marked_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Indexes for lightning fast lookups
CREATE INDEX `idx_sessions_date` ON `attendance_sessions` (`session_date`);
CREATE INDEX `idx_records_session_device` ON `attendance_records` (`session_id`, `device_fingerprint_hash`);
