package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResultDTO {
    private String questionId;
    private String text;
    private String type;
    private List<String> selectedOptionIds;
    private List<String> correctOptionIds;
    private Boolean isCorrect;
    private Double marksAwarded;
    private String explanation;
}
