package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSpentVectorDTO {
    private String id;
    private String nodeId;
    private String subject;
    private Integer unit;
    private Integer timeSpentSeconds;
    private String status; // "CORRECT" or "INCORRECT"
    private String complexity; // "EASY", "MEDIUM", "HARD"
}
