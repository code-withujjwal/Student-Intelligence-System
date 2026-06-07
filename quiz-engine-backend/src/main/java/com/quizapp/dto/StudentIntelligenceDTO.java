package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class StudentIntelligenceDTO {
    // SECTION 1: HERO PROFILE CARD
    private String fullName;
    private String username;
    private String academicStatus;
    private String institution;
    private Integer level;
    private Long xp;
    private String title; // Dynamic level title
    private Long globalRank;
    private Long collegeRank;
    private Long departmentRank;
    private Long quizzesCompleted;

    // SECTION 2: ACADEMIC OVERVIEW
    private Long quizzesAttempted;
    private Double averageAccuracy;
    private Integer currentStreak;
    private Double studyHours;
    private Integer subjectsMastered;

    // SECTION 3 & 4: ENGINEERING RADAR / MASTERY MATRIX
    private List<SubjectMasteryEntry> subjectMastery;

    // SECTION 5: HEATMAP
    private List<HeatmapEntry> heatmapData;

    // SECTION 6: ACHIEVEMENTS
    private List<BadgeEntry> achievements;

    // SECTION 7: TIMELINE
    private List<TimelineEntry> timeline;

    // SECTION 8: AI ACADEMIC INSIGHT
    private String aiInsight;

    // SECTION 9: PLACEMENT READINESS
    private Double placementReadinessScore;
    private List<String> recommendedNextFocus;

    // SECTION 11: RECENT ACTIVITY
    private List<RecentActivityEntry> recentActivities;

    // SECTION 12: KNOWLEDGE DNA
    private Map<String, Integer> knowledgeDNA;

    @Data
    @Builder
    public static class SubjectMasteryEntry {
        private String subject;
        private Integer mastery; // 0 to 100
        private Integer correctCount;
        private Integer totalCount;
    }

    @Data
    @Builder
    public static class HeatmapEntry {
        private String date; // YYYY-MM-DD
        private Integer count;
    }

    @Data
    @Builder
    public static class BadgeEntry {
        private String id;
        private String name;
        private String description;
        private Boolean unlocked;
        private String unlockedAt;
    }

    @Data
    @Builder
    public static class TimelineEntry {
        private String date;
        private String title;
        private String description;
    }

    @Data
    @Builder
    public static class RecentActivityEntry {
        private String type; // QUIZ_COMPLETED, BADGE_UNLOCKED, STREAK_MILESTONE
        private String description;
        private String date;
    }
}
