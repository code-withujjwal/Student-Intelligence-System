package com.quizapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuestionRequestDTO {
    private String title;
    private String questionText;
    private String questionType;
    private String department;
    private String subject;
    private String difficulty;
    private String status;
    private Double marks;
    private Double negativeMarks;
    private Object metadata; // Will map to JSON String
    private List<QuestionOptionDTO> options;
}
