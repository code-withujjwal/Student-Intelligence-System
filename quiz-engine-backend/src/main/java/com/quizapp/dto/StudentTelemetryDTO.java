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
public class StudentTelemetryDTO {
    private String studentId;
    private String name;
    private Integer globalMastery;
    private String recentStatus; // "ANOMALY_FLAGGED" or "OPTIMAL"
    private String weakestNode;
    private List<TimeSpentVectorDTO> timeSpentVectors;
}
