package com.quizapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizSectionDTO {
    private String title;
    private List<QuizQuestionDTO> questions;
}
