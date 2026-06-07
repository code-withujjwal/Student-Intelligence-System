package com.quizapp.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DailyChallengeDTO {
    private Long id;
    private String title;
    private String problemStatement;
    private String subject;
    private String topic;
    private String difficulty;
    private List<String> options;
    private LocalDateTime expiresAt;
    private Long remainingSeconds;
    private boolean alreadyAttempted;
    private Boolean previousResult;
    private Integer attemptCount;
    private Integer maxAttempts;
}
