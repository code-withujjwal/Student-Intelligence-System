package com.quizapp.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyChallengeAnalyticsDTO {
    private Long challengesAttempted;
    private Long challengesSolved;
    private Double successRate;
    private Long currentStreak;
    private Long longestStreak;
    private Long xpEarned;
}
