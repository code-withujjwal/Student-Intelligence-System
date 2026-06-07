package com.quizapp.service.ai;

import com.quizapp.dto.ai.AiQuizRequestDTO;
import com.quizapp.dto.ai.AiQuizResponseDTO;

public interface AIProvider {
    AiQuizResponseDTO generateQuiz(AiQuizRequestDTO request) throws Exception;
}
