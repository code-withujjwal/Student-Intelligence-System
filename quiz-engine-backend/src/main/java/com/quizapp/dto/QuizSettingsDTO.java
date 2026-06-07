package com.quizapp.dto;

import lombok.Data;

@Data
public class QuizSettingsDTO {
    private Integer durationMinutes;
    private String visibility;
    private Boolean shuffleQuestions;
    private Boolean shuffleOptions;
    private Boolean showResultImmediately;
    private Integer maxAttempts;
}
