package com.quizapp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String subject;
    private String status;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private Object settings;
    private List<QuizSectionDTO> sections;
    private LocalDateTime createdAt;
}
