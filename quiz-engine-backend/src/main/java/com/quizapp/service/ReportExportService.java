package com.quizapp.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.*;
import com.quizapp.dto.StudentIntelligenceDTO;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ReportExportService {

    private final Color primaryColor = new Color(11, 15, 25); // Dark blue theme background for labels
    private final Color accentColor = new Color(34, 211, 238);  // Cyan neon highlight
    private final Color textColor = new Color(241, 245, 249);    // Slate text color
    private final Color darkText = new Color(51, 65, 85);
    private final Color greenColor = new Color(16, 185, 129);   // Emerald
    private final Color purpleColor = new Color(168, 85, 247);   // Purple

    private void addHeaderBanner(Document doc, String titleText, StudentIntelligenceDTO data) throws DocumentException {
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, accentColor);
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, new Color(148, 163, 184));
        
        Paragraph title = new Paragraph(titleText.toUpperCase(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        
        Paragraph sub = new Paragraph("SECURE IDENTITY METRIC // GENERATED: " + 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), subtitleFont);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(15);
        doc.add(sub);
        
        // Info Grid
        PdfPTable infoTable = new PdfPTable(4);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingAfter(15);
        
        addInfoCell(infoTable, "OPERATIVE NAME", data.getFullName());
        addInfoCell(infoTable, "IDENTITY HANDLE", "@" + data.getUsername());
        addInfoCell(infoTable, "AFFILIATION", data.getInstitution());
        addInfoCell(infoTable, "ACADEMIC STATUS", data.getAcademicStatus());
        
        doc.add(infoTable);
        
        // Draw a separator line
        Paragraph line = new Paragraph("=========================================================================", 
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, accentColor));
        line.setAlignment(Element.ALIGN_CENTER);
        line.setSpacingAfter(15);
        doc.add(line);
    }

    private void addInfoCell(PdfPTable table, String label, String value) {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, accentColor);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
        
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(240, 253, 250));
        cell.setBorderColor(new Color(207, 250, 254));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Paragraph pLabel = new Paragraph(label, labelFont);
        pLabel.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pLabel);
        
        Paragraph pValue = new Paragraph(value != null ? value : "N/A", valueFont);
        pValue.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pValue);
        
        table.addCell(cell);
    }

    private void addSectionHeader(Document doc, String sectionName) throws DocumentException {
        Font secFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, accentColor);
        Paragraph p = new Paragraph("[ " + sectionName.toUpperCase() + " ]", secFont);
        p.setSpacingBefore(12);
        p.setSpacingAfter(8);
        doc.add(p);
    }

    public byte[] generateAcademicReport(StudentIntelligenceDTO data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            
            addHeaderBanner(doc, "Academic Intelligence Report", data);
            
            addSectionHeader(doc, "Intel Profile Summary");
            
            PdfPTable statsTable = new PdfPTable(3);
            statsTable.setWidthPercentage(100);
            statsTable.setSpacingAfter(15);
            
            addMetricCard(statsTable, "CURRENT LEVEL", "LEVEL " + data.getLevel(), data.getTitle());
            addMetricCard(statsTable, "GLOBAL PLATFORM RANK", "#" + data.getGlobalRank(), "Percentile: Top " + String.format("%.2f%%", (data.getGlobalRank() * 100.0) / Math.max(100, data.getGlobalRank() + 100)));
            addMetricCard(statsTable, "COMPLETED ASSESSMENTS", String.valueOf(data.getQuizzesCompleted()), "Attempts Secured");
            
            doc.add(statsTable);
            
            addSectionHeader(doc, "Learning Milestone Journey");
            
            if (data.getTimeline() == null || data.getTimeline().isEmpty()) {
                Paragraph emptyTimeline = new Paragraph("No milestone events recorded yet. Complete assessments to start your timeline.", FontFactory.getFont(FontFactory.HELVETICA, 10, darkText));
                doc.add(emptyTimeline);
            } else {
                PdfPTable timeTable = new PdfPTable(new float[]{1.5f, 3.5f, 5.0f});
                timeTable.setWidthPercentage(100);
                
                addTableHeaderCell(timeTable, "DATE");
                addTableHeaderCell(timeTable, "MILESTONE TITLE");
                addTableHeaderCell(timeTable, "JOURNAL SUMMARY");
                
                for (StudentIntelligenceDTO.TimelineEntry entry : data.getTimeline()) {
                    addTableCell(timeTable, entry.getDate());
                    addTableCell(timeTable, entry.getTitle());
                    addTableCell(timeTable, entry.getDescription());
                }
                doc.add(timeTable);
            }
            
            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return baos.toByteArray();
    }

    public byte[] generateSubjectReport(StudentIntelligenceDTO data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            
            addHeaderBanner(doc, "Subject Mastery & Curriculum Report", data);
            
            addSectionHeader(doc, "Engineering Core Mastery Matrix");
            
            if (data.getSubjectMastery() == null || data.getSubjectMastery().isEmpty()) {
                doc.add(new Paragraph("No subjects data available. Attempt subject quizzes to compile metrics.", FontFactory.getFont(FontFactory.HELVETICA, 10, darkText)));
            } else {
                PdfPTable matrixTable = new PdfPTable(new float[]{3f, 3f, 4f});
                matrixTable.setWidthPercentage(100);
                matrixTable.setSpacingAfter(15);
                
                addTableHeaderCell(matrixTable, "SUBJECT / CORE DOMAIN");
                addTableHeaderCell(matrixTable, "ACCURACY MASTERY");
                addTableHeaderCell(matrixTable, "TELEMETRY DETAILS");
                
                for (StudentIntelligenceDTO.SubjectMasteryEntry subject : data.getSubjectMastery()) {
                    addTableCell(matrixTable, subject.getSubject());
                    addTableCell(matrixTable, subject.getMastery() + "%");
                    addTableCell(matrixTable, subject.getCorrectCount() + " / " + subject.getTotalCount() + " Core Nodes Calibrated");
                }
                
                doc.add(matrixTable);
            }
            
            addSectionHeader(doc, "Overall Core Metrics");
            PdfPTable overviewTable = new PdfPTable(2);
            overviewTable.setWidthPercentage(100);
            
            addMetricCard(overviewTable, "AVERAGE ACCURACY", String.format("%.1f%%", data.getAverageAccuracy()), "Across all completed assessments");
            addMetricCard(overviewTable, "SUBJECTS DECLARED MASTERED", String.valueOf(data.getSubjectsMastered()), "Average Accuracy > 85%");
            
            doc.add(overviewTable);
            
            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return baos.toByteArray();
    }

    public byte[] generatePerformanceReport(StudentIntelligenceDTO data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            
            addHeaderBanner(doc, "Performance Analysis & History Report", data);
            
            addSectionHeader(doc, "Consistency Metric Overview");
            
            PdfPTable overviewTable = new PdfPTable(3);
            overviewTable.setWidthPercentage(100);
            overviewTable.setSpacingAfter(15);
            
            addMetricCard(overviewTable, "CURRENT STREAK", data.getCurrentStreak() + " DAYS", "Active Daily Routine");
            addMetricCard(overviewTable, "TOTAL STUDY TIME", String.format("%.1f HOURS", data.getStudyHours()), "Calibrated Quiz Time");
            addMetricCard(overviewTable, "TOTAL SOLVED QUESTIONS", String.valueOf(data.getQuizzesAttempted() * 5), "Quiz Attempt Nodes Checked");
            
            doc.add(overviewTable);
            
            addSectionHeader(doc, "Earned Tactical Achievements & Badges");
            
            if (data.getAchievements() == null || data.getAchievements().isEmpty()) {
                doc.add(new Paragraph("No badges unlocked. Build XP to unlock achievements.", FontFactory.getFont(FontFactory.HELVETICA, 10, darkText)));
            } else {
                PdfPTable achTable = new PdfPTable(new float[]{3f, 5f, 2f});
                achTable.setWidthPercentage(100);
                achTable.setSpacingAfter(15);
                
                addTableHeaderCell(achTable, "BADGE NAME");
                addTableHeaderCell(achTable, "CRITERIA & DESCRIPTION");
                addTableHeaderCell(achTable, "STATUS");
                
                for (StudentIntelligenceDTO.BadgeEntry badge : data.getAchievements()) {
                    addTableCell(achTable, badge.getName());
                    addTableCell(achTable, badge.getDescription());
                    addStatusCell(achTable, badge.getUnlocked() ? "UNLOCKED" : "LOCKED", badge.getUnlocked());
                }
                
                doc.add(achTable);
            }
            
            addSectionHeader(doc, "Recent Submissions Feed");
            
            if (data.getRecentActivities() == null || data.getRecentActivities().isEmpty()) {
                doc.add(new Paragraph("No recent activities recorded.", FontFactory.getFont(FontFactory.HELVETICA, 10, darkText)));
            } else {
                for (StudentIntelligenceDTO.RecentActivityEntry act : data.getRecentActivities()) {
                    Paragraph p = new Paragraph(String.format("• [%s] %s", act.getDate(), act.getDescription()), 
                        FontFactory.getFont(FontFactory.HELVETICA, 9, darkText));
                    p.setSpacingAfter(4);
                    doc.add(p);
                }
            }
            
            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return baos.toByteArray();
    }

    public byte[] generatePlacementReport(StudentIntelligenceDTO data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            
            addHeaderBanner(doc, "Placement Readiness Assessment Report", data);
            
            addSectionHeader(doc, "Global and Institutional Ranking");
            
            PdfPTable ranksTable = new PdfPTable(3);
            ranksTable.setWidthPercentage(100);
            ranksTable.setSpacingAfter(15);
            
            addMetricCard(ranksTable, "GLOBAL PLATFORM RANK", "#" + data.getGlobalRank(), "Out of all users");
            addMetricCard(ranksTable, "COLLEGE RANK", "#" + data.getCollegeRank(), "At " + data.getInstitution());
            addMetricCard(ranksTable, "DEPARTMENT RANK", "#" + data.getDepartmentRank(), "Branch: " + data.getAcademicStatus());
            
            doc.add(ranksTable);
            
            addSectionHeader(doc, "Placement Readiness Metrics");
            
            PdfPTable readinessTable = new PdfPTable(new float[]{4f, 6f});
            readinessTable.setWidthPercentage(100);
            readinessTable.setSpacingAfter(15);
            
            addMetricCard(readinessTable, "OVERALL PLACEMENT SCORE", String.format("%.1f%%", data.getPlacementReadinessScore()), "Derived from Core Computer Science subjects");
            
            // Focus Areas Paragraph
            StringBuilder focusText = new StringBuilder();
            if (data.getRecommendedNextFocus() == null || data.getRecommendedNextFocus().isEmpty()) {
                focusText.append("Maintain current comprehensive study routine.");
            } else {
                for (int i = 0; i < data.getRecommendedNextFocus().size(); i++) {
                    focusText.append(i + 1).append(". ").append(data.getRecommendedNextFocus().get(i)).append("\n");
                }
            }
            addMetricCard(readinessTable, "RECOMMENDED NEXT FOCUS", focusText.toString().trim(), "Priority Concepts to Study");
            
            doc.add(readinessTable);
            
            addSectionHeader(doc, "Gemini AI Academic Assessment Summary");
            
            PdfPTable insightTable = new PdfPTable(1);
            insightTable.setWidthPercentage(100);
            
            PdfPCell cell = new PdfPCell();
            cell.setPadding(12);
            cell.setBackgroundColor(new Color(248, 250, 252));
            cell.setBorderColor(new Color(226, 232, 240));
            cell.setBorderWidth(1.5f);
            
            Font aiFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, darkText);
            Paragraph aiParagraph = new Paragraph(data.getAiInsight() != null ? data.getAiInsight() : "No AI assessment summary compiled yet. Complete more quizzes to allow the AI agent to profile your learning DNA.", aiFont);
            aiParagraph.setLeading(14);
            cell.addElement(aiParagraph);
            insightTable.addCell(cell);
            
            doc.add(insightTable);
            
            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return baos.toByteArray();
    }

    private void addMetricCard(PdfPTable table, String label, String value, String description) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBackgroundColor(new Color(248, 250, 252));
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setBorderWidth(1);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(100, 116, 139));
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, accentColor);
        Font descFont = FontFactory.getFont(FontFactory.HELVETICA, 8, darkText);
        
        Paragraph pLabel = new Paragraph(label.toUpperCase(), labelFont);
        pLabel.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pLabel);
        
        Paragraph pValue = new Paragraph(value, valueFont);
        pValue.setAlignment(Element.ALIGN_CENTER);
        pValue.setSpacingBefore(3);
        pValue.setSpacingAfter(3);
        cell.addElement(pValue);
        
        Paragraph pDesc = new Paragraph(description, descFont);
        pDesc.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(pDesc);
        
        table.addCell(cell);
    }

    private void addTableHeaderCell(PdfPTable table, String label) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(primaryColor);
        cell.setPadding(8);
        cell.setBorderColor(new Color(30, 41, 59));
        
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
        Paragraph p = new Paragraph(label.toUpperCase(), font);
        cell.addElement(p);
        
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(6);
        cell.setBorderColor(new Color(226, 232, 240));
        
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 9, darkText);
        Paragraph p = new Paragraph(value != null ? value : "N/A", font);
        cell.addElement(p);
        
        table.addCell(cell);
    }

    private void addStatusCell(PdfPTable table, String status, boolean unlocked) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(6);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, unlocked ? greenColor : new Color(148, 163, 184));
        Paragraph p = new Paragraph(status, font);
        p.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p);
        
        table.addCell(cell);
    }

    public byte[] generateStudentReportPdf(String studentName, java.util.Map<String, Object> analytics) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document();
        
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();
            
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, accentColor);
            Paragraph title = new Paragraph("STUDENT ANALYTICS REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            doc.add(title);
            
            Paragraph sub = new Paragraph("Operative: " + studentName + " // Generated: " + LocalDateTime.now().toString());
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(25);
            doc.add(sub);
            
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            
            addMetricCard(table, "QUIZZES ATTEMPTED", String.valueOf(analytics.getOrDefault("quizzesAttempted", 0)), "Total count");
            addMetricCard(table, "AVERAGE ACCURACY", analytics.getOrDefault("averageAccuracy", 0.0) + "%", "Overall correctness");
            addMetricCard(table, "STRONGEST SUBJECT", String.valueOf(analytics.getOrDefault("strongestSubject", "N/A")), "Domain mastery peak");
            addMetricCard(table, "WEAKEST SUBJECT", String.valueOf(analytics.getOrDefault("weakestSubject", "N/A")), "Focus area recommended");
            
            doc.add(table);
            doc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return baos.toByteArray();
    }
}
