package com.quizapp.service.ai;

import com.quizapp.dto.ai.AiQuestionDTO;
import com.quizapp.dto.ai.AiQuizRequestDTO;
import com.quizapp.dto.ai.AiQuizResponseDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class RuleBasedGenerator {

    public AiQuizResponseDTO generateFallbackQuiz(AiQuizRequestDTO request) {
        AiQuizResponseDTO response = new AiQuizResponseDTO();
        response.setQuizTitle(request.getSubject() + " - Fallback Rule-Based Quiz");
        response.setSource("rule_based");
        
        List<AiQuestionDTO> questions = new ArrayList<>();
        int count = request.getQuestionCount() != null ? request.getQuestionCount() : 5;
        
        for (int i = 0; i < count; i++) {
            AiQuestionDTO q = new AiQuestionDTO();
            q.setType("SINGLE_CHOICE"); // Fallbacks default to simple MCQ
            q.setQuestion("Standard Template Question " + (i + 1) + " for subject " + request.getSubject() + " and topic " + request.getTopic());
            q.setOptions(Arrays.asList("Correct", "Wrong 1", "Wrong 2", "Wrong 3"));
            q.setAnswer("Correct");
            q.setMarks(2.0);
            questions.add(q);
        }
        
        response.setQuestions(questions);
        return response;
    }
}
