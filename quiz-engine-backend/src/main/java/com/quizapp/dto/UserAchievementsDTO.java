package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAchievementsDTO {
    private Integer currentLevel;
    private Long currentXP;
    private Long nextLevelXP;
    private Integer levelProgressPct;
    private Map<String, Long> domainTokens;
    private List<String> unlockedBadges;
}
