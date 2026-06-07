package com.quizapp.dto;

import lombok.Data;

@Data
public class QuizQuestionDTO {
    private Long questionId;
    private Double marks;
    private Double negativeMarks;
    private QuestionResponseDTO questionDetails;
}
