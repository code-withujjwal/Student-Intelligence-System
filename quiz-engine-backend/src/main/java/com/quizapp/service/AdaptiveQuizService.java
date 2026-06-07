package com.quizapp.service;

import com.quizapp.dto.AdaptiveProfileDTO;
import com.quizapp.entity.QuestionEntity;
import com.quizapp.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdaptiveQuizService {

    private final QuestionRepository questionRepository;
    private final StudentProfileService studentProfileService;

    public List<QuestionEntity> generateAdaptiveQuiz(Long studentId) {
        AdaptiveProfileDTO profile = studentProfileService.getProfile(studentId);
        
        List<QuestionEntity> allQuestions = questionRepository.findAll();
        
        // Algorithmic Filter: Prioritize weak areas
        List<QuestionEntity> adaptiveQuiz = allQuestions.stream()
                .filter(q -> profile.getWeakAreas().stream().anyMatch(weak -> q.getSubject() != null && q.getSubject().toLowerCase().contains(weak.split(" - ")[0].toLowerCase())))
                .limit(5)
                .collect(Collectors.toList());
                
        // Fallback if not enough matching weak area questions
        if (adaptiveQuiz.size() < 5) {
            adaptiveQuiz.addAll(allQuestions.stream().limit(5 - adaptiveQuiz.size()).collect(Collectors.toList()));
        }

        return adaptiveQuiz;
    }
}
