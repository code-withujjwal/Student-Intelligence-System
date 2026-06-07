package com.quizapp.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceTrendDTO {
    private String date; // "YYYY-MM-DD"
    private Long xpGrowth;
    private Double accuracyTrend;
    private Double scoreTrend;
}
