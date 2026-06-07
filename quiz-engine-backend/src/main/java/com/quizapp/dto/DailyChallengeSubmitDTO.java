package com.quizapp.dto;

import lombok.Data;

@Data
public class DailyChallengeSubmitDTO {
    private Long challengeId;
    private Integer selectedOptionIdx;
}
