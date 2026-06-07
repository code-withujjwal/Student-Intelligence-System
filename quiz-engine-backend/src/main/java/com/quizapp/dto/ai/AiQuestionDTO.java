package com.quizapp.dto.ai;

import lombok.Data;
import java.util.List;

@Data
public class AiQuestionDTO {
    private String type;
    private String question;
    private List<String> options;
    private String answer;
    private Double marks;
}
