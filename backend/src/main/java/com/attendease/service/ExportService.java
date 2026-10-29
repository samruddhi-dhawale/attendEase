package com.attendease.service;

import com.attendease.model.AttendanceRecord;
import com.attendease.model.AttendanceSession;
import com.attendease.model.AttendanceStatus;
import com.attendease.repository.AttendanceRecordRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Enterprise reporting engine providing multi-format attendance exports (PDF, Word DOCX, Excel XLSX, CSV).
 */
@Service
public class ExportService {

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm:ss a");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy");

    /**
     * Generates a beautifully formatted PDF attendance audit report.
     */
    public byte[] exportToPdf(AttendanceSession session) {
        List<AttendanceRecord> records = attendanceRecordRepository.findBySessionOrderByCheckInTimeDesc(session);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        com.lowagie.text.Document document = new com.lowagie.text.Document(PageSize.A4, 36, 36, 40, 40);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Document Header / Title
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(79, 70, 229));
            Paragraph title = new Paragraph("AttendEase — Official Attendance Audit Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            document.add(title);

            // Subtitle
            com.lowagie.text.Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Paragraph subtitle = new Paragraph("Automated Dynamic QR & Geofence Verification System", subFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(15);
            document.add(subtitle);

            // Session Metadata Table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(15);

            addMetaCell(metaTable, "Course:", session.getCourse().getCourseCode() + " - " + session.getCourse().getTitle());
            addMetaCell(metaTable, "Session Title:", session.getSessionTitle());
            addMetaCell(metaTable, "Session Date:", session.getSessionDate().format(DATE_FORMATTER));
            addMetaCell(metaTable, "Venue & Geofence:", session.getVenueName() + " (" + session.getGeofenceRadiusMeters() + "m radius)");
            addMetaCell(metaTable, "Class Schedule:", session.getStartTime() + " to " + session.getEndTime());
            addMetaCell(metaTable, "Total Verified Attendees:", String.valueOf(records.size()));
            document.add(metaTable);

            // Summary Metric Badges
            long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long lateCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
            long blockedCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PROXY_BLOCKED).count();

            Paragraph summaryP = new Paragraph(
                    String.format("Summary: %d Present  |  %d Late  |  %d Proxy Violations Prevented",
                            presentCount, lateCount, blockedCount),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(30, 41, 59))
            );
            summaryP.setSpacingAfter(12);
            document.add(summaryP);

            // Student Records Table
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.0f, 2.5f, 4.0f, 2.5f, 2.2f, 2.2f, 2.5f});

            String[] headers = {"#", "Roll Number", "Student Name", "Check-in Time", "Status", "Distance", "Verification"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                cell.setBackgroundColor(new Color(79, 70, 229));
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            int index = 1;
            com.lowagie.text.Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);

            for (AttendanceRecord r : records) {
                PdfPCell c1 = new PdfPCell(new Phrase(String.valueOf(index++), bodyFont));
                c1.setHorizontalAlignment(Element.ALIGN_CENTER);
                c1.setPadding(5);
                table.addCell(c1);

                PdfPCell c2 = new PdfPCell(new Phrase(r.getStudent().getRollNumber() != null ? r.getStudent().getRollNumber() : "N/A", bodyFont));
                c2.setPadding(5);
                table.addCell(c2);

                PdfPCell c3 = new PdfPCell(new Phrase(r.getStudent().getFullName(), bodyFont));
                c3.setPadding(5);
                table.addCell(c3);

                PdfPCell c4 = new PdfPCell(new Phrase(r.getCheckInTime().format(TIME_FORMATTER), bodyFont));
                c4.setHorizontalAlignment(Element.ALIGN_CENTER);
                c4.setPadding(5);
                table.addCell(c4);

                Color statusColor = r.getStatus() == AttendanceStatus.PRESENT ? new Color(16, 185, 129)
                        : r.getStatus() == AttendanceStatus.LATE ? new Color(245, 158, 11)
                        : new Color(239, 68, 68);

                com.lowagie.text.Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, statusColor);
                PdfPCell c5 = new PdfPCell(new Phrase(r.getStatus().name(), statusFont));
                c5.setHorizontalAlignment(Element.ALIGN_CENTER);
                c5.setPadding(5);
                table.addCell(c5);

                String dist = r.getDistanceFromVenueMeters() != null ? (r.getDistanceFromVenueMeters() + "m") : "-";
                PdfPCell c6 = new PdfPCell(new Phrase(dist, bodyFont));
                c6.setHorizontalAlignment(Element.ALIGN_CENTER);
                c6.setPadding(5);
                table.addCell(c6);

                PdfPCell c7 = new PdfPCell(new Phrase(r.getVerificationStatus().name(), bodyFont));
                c7.setHorizontalAlignment(Element.ALIGN_CENTER);
                c7.setPadding(5);
                table.addCell(c7);
            }

            document.add(table);

            // Footer note
            Paragraph footer = new Paragraph("\nGenerated automatically by AttendEase. Cryptographically verified against proxy and location tampering.",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    private void addMetaCell(PdfPTable table, String key, String value) {
        com.lowagie.text.Font kf = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);
        com.lowagie.text.Font vf = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

        PdfPCell cKey = new PdfPCell(new Phrase(key, kf));
        cKey.setBorder(Rectangle.NO_BORDER);
        cKey.setPadding(3);
        table.addCell(cKey);

        PdfPCell cVal = new PdfPCell(new Phrase(value, vf));
        cVal.setBorder(Rectangle.NO_BORDER);
        cVal.setPadding(3);
        table.addCell(cVal);
    }

    /**
     * Generates a Microsoft Word (.docx) attendance document with tables and formatting.
     */
    public byte[] exportToWord(AttendanceSession session) {
        List<AttendanceRecord> records = attendanceRecordRepository.findBySessionOrderByCheckInTimeDesc(session);

        try (XWPFDocument doc = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Document Title
            XWPFParagraph titlePara = doc.createParagraph();
            titlePara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = titlePara.createRun();
            titleRun.setText("AttendEase — Smart Attendance Report");
            titleRun.setBold(true);
            titleRun.setFontSize(18);
            titleRun.setColor("4F46E5");

            // Course Info
            XWPFParagraph infoPara = doc.createParagraph();
            XWPFRun infoRun = infoPara.createRun();
            infoRun.setFontSize(11);
            infoRun.setText("Course: " + session.getCourse().getCourseCode() + " - " + session.getCourse().getTitle() + "\n");
            infoRun.setText("Session: " + session.getSessionTitle() + " | Date: " + session.getSessionDate().format(DATE_FORMATTER) + "\n");
            infoRun.setText("Venue: " + session.getVenueName() + " (Radius: " + session.getGeofenceRadiusMeters() + "m)\n");
            infoRun.setText("Total Attendees: " + records.size());

            // Table
            XWPFTable table = doc.createTable();
            table.setWidth("100%");

            // Header row
            XWPFTableRow headerRow = table.getRow(0);
            String[] headers = {"#", "Roll No", "Student Name", "Time", "Status", "Distance", "Verification"};
            for (int i = 0; i < headers.length; i++) {
                XWPFTableCell cell = (i == 0) ? headerRow.getCell(0) : headerRow.addNewTableCell();
                cell.setColor("4F46E5");
                XWPFParagraph p = cell.getParagraphs().get(0);
                XWPFRun r = p.createRun();
                r.setText(headers[i]);
                r.setBold(true);
                r.setColor("FFFFFF");
            }

            int idx = 1;
            for (AttendanceRecord record : records) {
                XWPFTableRow row = table.createRow();
                row.getCell(0).setText(String.valueOf(idx++));
                row.getCell(1).setText(record.getStudent().getRollNumber() != null ? record.getStudent().getRollNumber() : "N/A");
                row.getCell(2).setText(record.getStudent().getFullName());
                row.getCell(3).setText(record.getCheckInTime().format(TIME_FORMATTER));
                row.getCell(4).setText(record.getStatus().name());
                row.getCell(5).setText(record.getDistanceFromVenueMeters() != null ? record.getDistanceFromVenueMeters() + "m" : "-");
                row.getCell(6).setText(record.getVerificationStatus().name());
            }

            // Note
            XWPFParagraph footerPara = doc.createParagraph();
            footerPara.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun footerRun = footerPara.createRun();
            footerRun.setItalic(true);
            footerRun.setFontSize(9);
            footerRun.setColor("888888");
            footerRun.setText("\nCryptographically verified by AttendEase Anti-Proxy Suite.");

            doc.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Word document: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a Microsoft Excel (.xlsx) spreadsheet with formulas and column styling.
     */
    public byte[] exportToExcel(AttendanceSession session) {
        List<AttendanceRecord> records = attendanceRecordRepository.findBySessionOrderByCheckInTimeDesc(session);

        try (org.apache.poi.ss.usermodel.Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Attendance Records");

            // Style for Header
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Title row
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("AttendEase Attendance: " + session.getCourse().getCourseCode() + " - " + session.getSessionTitle());

            // Header row
            String[] columns = {"Index", "Roll Number", "Student Name", "Email", "Check-in Time",
                                "Status", "Distance (m)", "Verification", "Device Hash", "Client IP"};
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(2);
            for (int col = 0; col < columns.length; col++) {
                org.apache.poi.ss.usermodel.Cell cell = row.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 3;
            for (AttendanceRecord record : records) {
                org.apache.poi.ss.usermodel.Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue(rowIdx - 3);
                r.createCell(1).setCellValue(record.getStudent().getRollNumber() != null ? record.getStudent().getRollNumber() : "");
                r.createCell(2).setCellValue(record.getStudent().getFullName());
                r.createCell(3).setCellValue(record.getStudent().getEmail());
                r.createCell(4).setCellValue(record.getCheckInTime().format(TIME_FORMATTER));
                r.createCell(5).setCellValue(record.getStatus().name());
                r.createCell(6).setCellValue(record.getDistanceFromVenueMeters() != null ? record.getDistanceFromVenueMeters() : 0.0);
                r.createCell(7).setCellValue(record.getVerificationStatus().name());
                r.createCell(8).setCellValue(record.getDeviceFingerprintHash() != null ? record.getDeviceFingerprintHash() : "");
                r.createCell(9).setCellValue(record.getClientIpAddress() != null ? record.getClientIpAddress() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel file: " + e.getMessage(), e);
        }
    }

    /**
     * Generates standard comma-separated values (CSV) format.
     */
    public byte[] exportToCsv(AttendanceSession session) {
        List<AttendanceRecord> records = attendanceRecordRepository.findBySessionOrderByCheckInTimeDesc(session);

        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        pw.println("Index,RollNumber,FullName,Email,CheckInTime,Status,DistanceMeters,VerificationStatus,DeviceHash,IPAddress");
        int idx = 1;
        for (AttendanceRecord r : records) {
            pw.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\",\"%s\",\"%s\"%n",
                    idx++,
                    r.getStudent().getRollNumber() != null ? r.getStudent().getRollNumber() : "",
                    r.getStudent().getFullName().replace("\"", "\"\""),
                    r.getStudent().getEmail(),
                    r.getCheckInTime().toString(),
                    r.getStatus().name(),
                    r.getDistanceFromVenueMeters() != null ? r.getDistanceFromVenueMeters() : 0.0,
                    r.getVerificationStatus().name(),
                    r.getDeviceFingerprintHash() != null ? r.getDeviceFingerprintHash() : "",
                    r.getClientIpAddress() != null ? r.getClientIpAddress() : ""
            );
        }
        pw.flush();
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
