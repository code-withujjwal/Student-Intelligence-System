package com.quizapp.dto;

import lombok.Data;

@Data
public class QuestionOptionResponseDTO {
    private Long id;
    private String optionText;
    private Boolean isCorrect;
}
