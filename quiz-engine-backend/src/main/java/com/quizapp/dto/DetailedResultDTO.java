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
public class DetailedResultDTO {
    private String attemptId;
    private String quizId;
    private String quizTitle;
    private String userId;
    private Double score;
    private Double totalMarks;
    private Double accuracy;
    private Integer timeTakenSeconds;
    private Integer rank;
    private Integer correctCount;
    private Integer incorrectCount;
    private Integer skippedCount;
    private List<SubjectBreakdownDTO> subjectBreakdown;
    private List<QuestionResultDTO> questionResults;
    private List<String> weakTopics;
    private List<String> strongTopics;
    private String completedAt;
}
