package com.quizapp.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressOverviewDTO {
    private Long totalXp;
    private Integer globalRank;
    private Double accuracyPercentage;
    private Long quizzesAttempted;
    private Long questionsSolved;
    private Long currentStreak;
}
