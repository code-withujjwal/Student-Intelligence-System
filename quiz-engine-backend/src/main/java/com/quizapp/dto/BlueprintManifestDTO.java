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
public class BlueprintManifestDTO {
    private String id;
    private String name;
    private String subject;
    private List<Integer> units;
    private BlueprintCompositionDTO composition;
    private String deployedTo;
    private String status;
}
