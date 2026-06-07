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
public class TeacherDashboardResponseDTO {
    private List<StudentTelemetryDTO> roster;
    private List<BlueprintManifestDTO> blueprints;
    private Integer totalAuditedStudents;
    private Integer integrityAnomaliesCount;
    private Integer avgClassroomMastery;
}
