package com.quizapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubmitAttemptRequestDTO {
    private List<SubmitAnswerDTO> answers;
}
