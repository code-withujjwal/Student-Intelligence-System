package com.quizapp.dto;

import lombok.Data;

@Data
public class StartAttemptRequestDTO {
    private Long quizId;
    private String userId;
}
