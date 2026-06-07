package com.quizapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizRequestDTO {
    private String title;
    private String description;
    private String subject;
    private String department;
    private Integer semester;
    private String difficulty;
    private List<QuizSectionDTO> sections;
    private QuizSettingsDTO settings;
}
