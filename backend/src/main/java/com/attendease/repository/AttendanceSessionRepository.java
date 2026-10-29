package com.attendease.repository;

import com.attendease.model.AttendanceSession;
import com.attendease.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByCourseOrderBySessionDateDescStartTimeDesc(Course course);
    List<AttendanceSession> findBySessionDate(LocalDate date);
    List<AttendanceSession> findByActiveTrue();
    List<AttendanceSession> findAllByOrderBySessionDateDescStartTimeDesc();
}
