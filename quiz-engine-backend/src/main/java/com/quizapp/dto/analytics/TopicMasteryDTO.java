package com.quizapp.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicMasteryDTO {
    private String topic;
    private String subject;
    private String chapter;
    private Double accuracy;
    private Double masteryPercentage;
    private String strength; // "WEAK", "AVERAGE", "STRONG"
}
