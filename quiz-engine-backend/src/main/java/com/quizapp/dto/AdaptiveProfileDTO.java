package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdaptiveProfileDTO {
    private Long studentId;
    private List<String> weakAreas;
    private List<String> strongAreas;
    private String preferredDifficulty;
    private Double avgResponseTime;
}
