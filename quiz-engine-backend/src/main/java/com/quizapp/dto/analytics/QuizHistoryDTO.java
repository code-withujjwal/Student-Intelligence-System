package com.quizapp.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizHistoryDTO {
    private String quizId;
    private String quizName;
    private String subject;
    private LocalDateTime date;
    private Double score;
    private Double accuracy;
    private Double timeTaken;
    private Integer correctCount;
    private Integer incorrectCount;
    private Integer skippedCount;
}
