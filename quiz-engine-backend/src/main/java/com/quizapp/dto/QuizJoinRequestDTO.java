package com.quizapp.dto;

import lombok.Data;

@Data
public class QuizJoinRequestDTO {
    private String sessionId;
    private String username;
}
