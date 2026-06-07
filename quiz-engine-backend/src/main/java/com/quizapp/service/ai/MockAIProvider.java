package com.quizapp.service.ai;

import com.quizapp.dto.ai.AiQuestionDTO;
import com.quizapp.dto.ai.AiQuizRequestDTO;
import com.quizapp.dto.ai.AiQuizResponseDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class MockAIProvider implements AIProvider {

    @Override
    public AiQuizResponseDTO generateQuiz(AiQuizRequestDTO request) throws Exception {
        // Simulate network delay
        Thread.sleep(2000);
        
        // Simulating a failure occasionally? Let's just always succeed for mock.
        // If we want to test rule-based, we can throw an exception.
        // For now, return a mock response.

        AiQuizResponseDTO response = new AiQuizResponseDTO();
        response.setQuizTitle(request.getSubject() + " - " + request.getTopic() + " (Mock AI)");
        response.setSource("ai");
        
        List<AiQuestionDTO> questions = new ArrayList<>();
        int count = request.getQuestionCount() != null ? request.getQuestionCount() : 5;
        
        for (int i = 0; i < count; i++) {
            AiQuestionDTO q = new AiQuestionDTO();
            q.setType(request.getIncludeTypes() != null && !request.getIncludeTypes().isEmpty() 
                    ? request.getIncludeTypes().get(i % request.getIncludeTypes().size()) 
                    : "SINGLE_CHOICE");
            q.setQuestion("AI Generated Question " + (i + 1) + " about " + request.getTopic() + "?");
            q.setOptions(Arrays.asList("Option A", "Option B", "Option C", "Option D"));
            q.setAnswer("Option A");
            q.setMarks(2.0);
            questions.add(q);
        }
        
        response.setQuestions(questions);
        return response;
    }
}
