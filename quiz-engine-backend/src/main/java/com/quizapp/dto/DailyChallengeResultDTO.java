package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DailyChallengeResultDTO {
    private boolean isCorrect;
    private String explanation;
    private Integer correctOptionIdx;
    private Long xpGained;
    private Integer attemptCount;
    private Integer maxAttempts;
    private boolean hasMoreAttempts;
}
