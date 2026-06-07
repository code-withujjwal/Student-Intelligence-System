package com.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptDTO {
    private String id;
    private String quizId;
    private String userId;
    private List<Object> answers = new ArrayList<>();
    private String startedAt;
    private String submittedAt;
}
