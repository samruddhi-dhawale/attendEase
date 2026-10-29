package com.attendease.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String courseCode; // e.g. CS401

    @Column(nullable = false, length = 150)
    private String title; // e.g. Distributed Systems & Cloud Computing

    @Column(length = 100)
    private String department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(length = 500)
    private String description;

    @Column(length = 30)
    private String semester; // e.g. Fall 2026

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Course() {}

    public Course(String courseCode, String title, String department, User instructor, String description, String semester) {
        this.courseCode = courseCode;
        this.title = title;
        this.department = department;
        this.instructor = instructor;
        this.description = description;
        this.semester = semester;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public User getInstructor() { return instructor; }
    public void setInstructor(User instructor) { this.instructor = instructor; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
