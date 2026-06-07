package com.quizapp.dto;

import lombok.Data;

@Data
public class QuestionOptionDTO {
    private String optionText;
    private Boolean isCorrect;
}
