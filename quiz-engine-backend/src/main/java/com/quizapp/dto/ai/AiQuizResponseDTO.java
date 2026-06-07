package com.quizapp.dto.ai;

import lombok.Data;
import java.util.List;

@Data
public class AiQuizResponseDTO {
    private String quizTitle;
    private String source; // "ai" or "rule_based"
    private List<AiQuestionDTO> questions;
}
