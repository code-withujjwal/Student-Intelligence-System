package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlueprintCompositionDTO {
    private Integer conceptual;
    private Integer analytical;
    private Integer code;
}
