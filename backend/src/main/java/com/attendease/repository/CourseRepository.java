package com.attendease.repository;

import com.attendease.model.Course;
import com.attendease.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByInstructor(User instructor);
    List<Course> findByDepartment(String department);
    boolean existsByCourseCode(String courseCode);
}
