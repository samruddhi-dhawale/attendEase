# AttendEase — Smart Anti-Proxy Attendance Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-17%20LTS-orange.svg)](https://www.oracle.com/java/)
[![JWT](https://img.shields.io/badge/JWT-jjwt--0.11.5-yellow.svg)](https://jwt.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> **AttendEase** is an enterprise-grade, proxy-free attendance management platform designed to eliminate attendance fraud through **10-second rotating cryptographic QR codes**, **Haversine GPS geofence validation**, **hardware device fingerprinting**, and **duplicate-check locks**. Complete with automated reporting in **PDF, Microsoft Word (.docx), Excel (.xlsx), and CSV**.

---

## 🚀 Key Architectural Pillars

### 1. 🛡️ 10-Second Dynamic Rotating QR Codes (HMAC-SHA256)
- The teacher's or administrator's projector screen generates a dynamic token rotated strictly every **10 seconds**.
- The token is cryptographically signed using **HMAC-SHA256** combined with a secret session salt and current time slot.
- **Anti-Screenshot Sharing:** If a student takes a screenshot of the QR code and sends it to an absent peer over WhatsApp or Telegram, the 10-second window will have expired before the recipient can scan it.

### 2. 📍 Haversine Geolocation Validation & Geofencing
- The instructor configures the classroom/venue coordinates (Latitude & Longitude) and an allowed perimeter radius (e.g. 50m, 100m, 150m).
- When a student scans, their device submits HTML5 GPS coordinates with high accuracy.
- The backend evaluates the great-circle distance using the spherical **Haversine Formula**:
  $$\text{distance} = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
- If $\text{distance} > \text{allowedRadius}$, attendance is automatically **flagged and blocked** (`FAILED_GEOFENCE`).

### 3. 📱 Hardware Device Fingerprinting & Proxy Prevention
- Each student's device generates a unique hardware signature (User-Agent, screen resolution, color depth, canvas render hash, hardware concurrency).
- **One-Device-Per-Student Lock:** If a student in class borrows peers' login credentials to check them in on the same phone, the backend detects the duplicate hardware fingerprint in the same session and triggers a `FAILED_DEVICE_PROXY` alert.

### 4. 🔒 Duplicate Attendance & Punctuality Engine
- Database-level unique constraint on `(session_id, student_id)` prevents multi-marking.
- Flexible punctuality grace window (configurable, default 15 minutes) classifies arrivals into `PRESENT` vs. `LATE`.
- Faculty manual adjustment override module allows excused absences with audit remarks.

### 5. 📊 Multi-Format Reporting & Institutional Export
One-click export directly from the Faculty Dashboard:
- **PDF Export:** Formatted official report with institutional header, summary KPI cards, and student audit table with colored status badges (via OpenPDF).
- **Word (.docx) Export:** Formatted Microsoft Word document with styled tables and security metadata (via Apache POI).
- **Excel (.xlsx) Export:** Spreadsheet with student details, timestamps, exact distances in meters, and device hash (via Apache POI).
- **CSV Export:** Machine-readable tabular format for university ERP or HRMS ingestion.

---

## 🛠️ Tech Stack & Directory Structure

```
attendease/
├── backend/                  # Java 17 + Spring Boot 3.2.4
│   ├── src/main/java/com/attendease/
│   │   ├── config/           # Spring Security, JWT Auth Filter, Token Provider
│   │   ├── controller/       # Auth, Courses, Sessions, Attendance, Export REST APIs
│   │   ├── dto/              # AuthRequest/Response, CheckIn, SessionCreate, Analytics
│   │   ├── exception/        # Global Exception Handler
│   │   ├── model/            # User, Role, Course, AttendanceSession, AttendanceRecord
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   └── service/          # GeolocationService, QrCodeTokenService, DeviceFingerprintService, ExportService
│   ├── src/main/resources/
│   │   ├── application.properties        # Zero-setup H2 MySQL mode (default)
│   │   ├── application-mysql.properties  # Production MySQL 8.0 configuration
│   │   └── schema-mysql.sql              # MySQL DDL Schema
│   └── pom.xml
│
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/client.js     # Axios client with JWT interceptor & download helpers
│   │   ├── components/       # LiveQrProjector, StudentQrScanner, StudentHistory, Navbar
│   │   ├── context/          # AuthContext (Role management, demo account switcher)
│   │   ├── pages/            # AuthPage, FacultyDashboard
│   │   └── utils/            # Anti-Proxy Device Fingerprint Generator
│   ├── package.json
│   └── vite.config.js        # Reverse proxy to backend on port 8080
│
├── start-backend.ps1         # Windows PowerShell launcher for backend
├── start-frontend.ps1        # Windows PowerShell launcher for frontend
└── README.md
```

---

## 🔑 Pre-Configured Demo Credentials

The database automatically seeds with default faculty, students, courses, and active sessions:

| Role | Name | Email | Password | Identifiers |
|---|---|---|---|---|
| **Faculty / Admin** | Dr. Rajesh Sharma | `prof.sharma@attendease.edu` | `Password123!` | Employee ID: `FAC-1001` |
| **Student 1** | Alex Morgan | `alex.morgan@attendease.edu` | `Password123!` | Roll No: `CS2026-042` |
| **Student 2** | Priya Patel | `priya.patel@attendease.edu` | `Password123!` | Roll No: `CS2026-088` |
| **Student 3** | David Chen | `david.chen@attendease.edu` | `Password123!` | Roll No: `CS2026-115` |

> 💡 **Quick Tip:** The login page includes **"Instant 1-Click Demo Evaluation"** buttons to log in as Faculty or Student with zero typing!

---

## 🚀 Running the Project

### 1. Launch Spring Boot Backend (Port 8080)
```powershell
cd C:\Users\SUNIL\.gemini\antigravity\scratch\attendease
.\start-backend.ps1
```
*Backend runs on `http://localhost:8080` with embedded H2 (MySQL Mode) out-of-the-box.*

### 2. Launch React Frontend (Port 3000)
```powershell
cd C:\Users\SUNIL\.gemini\antigravity\scratch\attendease
.\start-frontend.ps1
```
*Frontend runs on `http://localhost:3000`.*

---

## 🗄️ Switching to Production MySQL

1. Ensure MySQL is running on port 3306.
2. Run `schema-mysql.sql` in MySQL Workbench or CLI:
   ```bash
   mysql -u root -p < backend/src/main/resources/schema-mysql.sql
   ```
3. Start backend with the MySQL profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student or faculty account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |
| `GET` | `/api/courses` | List all academic courses | Authenticated |
| `POST` | `/api/courses` | Create new course | Faculty / Admin |
| `GET` | `/api/sessions` | List sessions (optional `?activeOnly=true`) | Authenticated |
| `POST` | `/api/sessions` | Create session with venue geofence | Faculty / Admin |
| `PATCH`| `/api/sessions/{id}/status` | Open or close attendance window | Faculty / Admin |
| `GET` | `/api/sessions/{id}/live-qr` | Fetch rotating 10s HMAC QR data URI | Faculty / Admin |
| `POST` | `/api/attendance/check-in` | Submit attendance with GPS & device hash | Student |
| `GET` | `/api/attendance/session/{id}` | Audit records for a specific session | Authenticated |
| `GET` | `/api/attendance/my-history` | Attendance record dossier for logged student | Student |
| `PATCH`| `/api/attendance/{id}/override` | Manually excuse or modify attendance record | Faculty / Admin |
| `GET` | `/api/analytics/dashboard` | Overall KPI summary (attendance %, proxy blocks) | Faculty / Admin |
| `GET` | `/api/export/pdf/{sessionId}` | Download official attendance report as PDF | Authenticated |
| `GET` | `/api/export/word/{sessionId}` | Download attendance report as Word (.docx) | Authenticated |
| `GET` | `/api/export/excel/{sessionId}` | Download attendance records as Excel (.xlsx) | Authenticated |
| `GET` | `/api/export/csv/{sessionId}` | Download raw attendance data as CSV | Authenticated |
