package com.attendease.controller;

import com.attendease.model.AttendanceSession;
import com.attendease.service.AttendanceSessionService;
import com.attendease.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportReportController {

    @Autowired
    private ExportService exportService;

    @Autowired
    private AttendanceSessionService sessionService;

    @GetMapping("/pdf/{sessionId}")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long sessionId) {
        AttendanceSession session = sessionService.getSessionById(sessionId);
        byte[] pdfBytes = exportService.exportToPdf(session);

        String filename = "attendease-attendance-" + session.getCourse().getCourseCode() + "-session-" + sessionId + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/word/{sessionId}")
    public ResponseEntity<byte[]> exportWord(@PathVariable Long sessionId) {
        AttendanceSession session = sessionService.getSessionById(sessionId);
        byte[] docxBytes = exportService.exportToWord(session);

        String filename = "attendease-attendance-" + session.getCourse().getCourseCode() + "-session-" + sessionId + ".docx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(docxBytes);
    }

    @GetMapping("/excel/{sessionId}")
    public ResponseEntity<byte[]> exportExcel(@PathVariable Long sessionId) {
        AttendanceSession session = sessionService.getSessionById(sessionId);
        byte[] xlsxBytes = exportService.exportToExcel(session);

        String filename = "attendease-attendance-" + session.getCourse().getCourseCode() + "-session-" + sessionId + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(xlsxBytes);
    }

    @GetMapping("/csv/{sessionId}")
    public ResponseEntity<byte[]> exportCsv(@PathVariable Long sessionId) {
        AttendanceSession session = sessionService.getSessionById(sessionId);
        byte[] csvBytes = exportService.exportToCsv(session);

        String filename = "attendease-attendance-" + session.getCourse().getCourseCode() + "-session-" + sessionId + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}
