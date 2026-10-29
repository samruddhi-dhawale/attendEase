package com.attendease.repository;

import com.attendease.model.AttendanceRecord;
import com.attendease.model.AttendanceSession;
import com.attendease.model.AttendanceStatus;
import com.attendease.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySessionOrderByCheckInTimeDesc(AttendanceSession session);
    List<AttendanceRecord> findByStudentOrderByCheckInTimeDesc(User student);
    Optional<AttendanceRecord> findBySessionAndStudent(AttendanceSession session, User student);
    boolean existsBySessionAndStudent(AttendanceSession session, User student);
    
    // Anti-Proxy: Check if device fingerprint was already used in this session by someone else
    Optional<AttendanceRecord> findFirstBySessionAndDeviceFingerprintHash(AttendanceSession session, String deviceFingerprintHash);
    
    long countBySession(AttendanceSession session);
    long countBySessionAndStatus(AttendanceSession session, AttendanceStatus status);
    long countByStudentAndStatus(User student, AttendanceStatus status);
    long countByStudent(User student);
}
