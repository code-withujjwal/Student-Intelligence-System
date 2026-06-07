package com.quizapp.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardEntryDTO {
    private Integer rank;
    private String username;
    private Double score;
    private Long xp;
    private Long questionsSolved;
    private Long dailyChallengeScore;
    private Integer level;
    private Long streak;
}
