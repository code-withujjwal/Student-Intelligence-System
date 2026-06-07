package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectBreakdownDTO {
    private String subject;
    private Integer totalQuestions;
    private Integer correctCount;
    private Double accuracy;
}
