package com.quizapp.dto.ai;

import lombok.Data;
import java.util.List;

@Data
public class AiQuizRequestDTO {
    private String subject;
    private String topic;
    private String difficulty;
    private Integer questionCount;
    private List<String> includeTypes;
    private String department;
    private Integer semester;
    private String mode; // e.g. SUBJECT, UNIT, FULL_EXAM, PLACEMENT, INTERVIEW, WEAK_TOPIC, NOTES
    private String unit; // e.g. "Unit 3"
    private String style; // e.g. "Amazon"
    private String notesText;
}
