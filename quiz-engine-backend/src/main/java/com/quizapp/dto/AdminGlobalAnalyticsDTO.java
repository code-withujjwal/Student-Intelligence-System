package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminGlobalAnalyticsDTO {
    private Long totalStudents;
    private Long activeToday;
    private Long quizzesAttempted;
    private Double averageAccuracy;
    private Double placementReadiness;
    private Long facultyCount;
    private Double growthPercentage;
}
