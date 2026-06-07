package com.quizapp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuestionResponseDTO {
    private Long id;
    private String publicId;
    private String title;
    private String questionText;
    private String questionType;
    private String department;
    private String subject;
    private String difficulty;
    private String status;
    private Double marks;
    private Double negativeMarks;
    private Object metadata;
    private List<QuestionOptionResponseDTO> options;
    private LocalDateTime createdAt;
}
