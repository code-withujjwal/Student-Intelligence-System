package com.quizapp.controller;

import com.quizapp.service.AnalyticsService;
import com.quizapp.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ReportExportService reportExportService;
    private final AnalyticsService analyticsService;

    @GetMapping("/pdf/student/{id}")
    public ResponseEntity<byte[]> exportStudentReport(@PathVariable Long id) {
        Map<String, Object> analytics = analyticsService.getStudentAnalytics(id);
        
        // Mock name. In reality, fetch UserEntity by id to get real name.
        byte[] pdfBytes = reportExportService.generateStudentReportPdf("Student " + id, analytics);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "student_report_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
