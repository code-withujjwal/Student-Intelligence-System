package com.quizapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubmitAnswerDTO {
    private String questionId;
    private List<String> selectedOptionIds;
    private String textAnswer;
    private Integer timeSpentSeconds;
    private Boolean isMarkedForReview;
    private String status;
}
