package com.quizapp.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectAnalyticsDTO {
    private String subject;
    private Double accuracy;
    private Long questionsSolved;
    private Double averageScore;
    private Double masteryPercentage;
    private Double improvementTrend;
}
