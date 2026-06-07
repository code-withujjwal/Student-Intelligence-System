package com.quizapp.dto;

import lombok.Data;

@Data
public class QuizAnswerDTO {
    private String sessionId;
    private String username;
    private Long questionId;
    private String answer;
    private Double timeTakenSeconds;
}
