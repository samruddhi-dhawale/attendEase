package com.attendease.service;

import com.attendease.exception.AttendEaseException;
import com.attendease.model.Course;
import com.attendease.model.User;
import com.attendease.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new AttendEaseException("Course not found with ID: " + id));
    }

    public Course createCourse(Course course, User instructor) {
        if (courseRepository.existsByCourseCode(course.getCourseCode())) {
            throw new AttendEaseException("Course code already exists: " + course.getCourseCode());
        }
        course.setInstructor(instructor);
        return courseRepository.save(course);
    }
}
