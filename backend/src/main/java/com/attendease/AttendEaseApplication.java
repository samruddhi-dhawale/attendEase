package com.attendease;

import com.attendease.model.*;
import com.attendease.repository.AttendanceRecordRepository;
import com.attendease.repository.AttendanceSessionRepository;
import com.attendease.repository.CourseRepository;
import com.attendease.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@SpringBootApplication
public class AttendEaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(AttendEaseApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                          CourseRepository courseRepository,
                                          AttendanceSessionRepository sessionRepository,
                                          AttendanceRecordRepository recordRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            System.out.println(">>> Seeding AttendEase Demo Records (Faculty, Students, Courses, Active Sessions)...");

            // 1. Seed Faculty / Admin
            User faculty = new User(
                    "prof.sharma@attendease.edu",
                    passwordEncoder.encode("Password123!"),
                    "Dr. Rajesh Sharma",
                    "FAC-1001",
                    "Computer Science & Engineering",
                    Role.ROLE_FACULTY
            );
            userRepository.save(faculty);

            // 2. Seed Students
            User student1 = new User(
                    "alex.morgan@attendease.edu",
                    passwordEncoder.encode("Password123!"),
                    "Alex Morgan",
                    "CS2026-042",
                    "Computer Science & Engineering",
                    Role.ROLE_STUDENT
            );
            userRepository.save(student1);

            User student2 = new User(
                    "priya.patel@attendease.edu",
                    passwordEncoder.encode("Password123!"),
                    "Priya Patel",
                    "CS2026-088",
                    "Computer Science & Engineering",
                    Role.ROLE_STUDENT
            );
            userRepository.save(student2);

            User student3 = new User(
                    "david.chen@attendease.edu",
                    passwordEncoder.encode("Password123!"),
                    "David Chen",
                    "CS2026-115",
                    "Computer Science & Engineering",
                    Role.ROLE_STUDENT
            );
            userRepository.save(student3);

            // 3. Seed Courses
            Course c1 = new Course(
                    "CS401",
                    "Distributed Systems & Cloud Computing",
                    "Computer Science",
                    faculty,
                    "In-depth analysis of consensus protocols, fault tolerance, replication, and cloud microservices.",
                    "Fall 2026"
            );
            courseRepository.save(c1);

            Course c2 = new Course(
                    "CS302",
                    "Advanced Database Management Systems",
                    "Computer Science",
                    faculty,
                    "Relational calculus, query optimization, indexing algorithms, and transaction isolation levels.",
                    "Fall 2026"
            );
            courseRepository.save(c2);

            Course c3 = new Course(
                    "AI305",
                    "Applied Machine Learning & Deep Networks",
                    "Artificial Intelligence",
                    faculty,
                    "Convolutional and transformer architectures, reinforcement learning, and production deployments.",
                    "Fall 2026"
            );
            courseRepository.save(c3);

            // 4. Seed Live Active Session
            AttendanceSession session = new AttendanceSession(
                    c1,
                    "Lecture 22: Raft Consensus & Byzantine Fault Tolerance",
                    LocalDate.now(),
                    LocalTime.now().minusMinutes(10),
                    LocalTime.now().plusHours(1),
                    "Auditorium Hall 4A (Science Block)",
                    12.9716, // Bangalore Tech Hub default coordinates
                    77.5946,
                    150.0, // 150m geofence radius
                    faculty
            );
            sessionRepository.save(session);

            // 5. Seed an existing verified check-in
            AttendanceRecord rec1 = new AttendanceRecord(
                    session,
                    student1,
                    AttendanceStatus.PRESENT,
                    VerificationStatus.VERIFIED,
                    12.97161,
                    77.59462,
                    3.2,
                    "dev-hash-88f912ca",
                    "192.168.1.45",
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)",
                    "On time verification"
            );
            rec1.setCheckInTime(LocalDateTime.now().minusMinutes(8));
            recordRepository.save(rec1);

            System.out.println(">>> AttendEase Demo Data Initialized Successfully!");
            System.out.println("    Faculty Login: prof.sharma@attendease.edu / Password123!");
            System.out.println("    Student Login: alex.morgan@attendease.edu / Password123!");
        };
    }
}
