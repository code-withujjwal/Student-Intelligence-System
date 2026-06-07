package com.quizapp.controller;

import com.quizapp.service.ai.AIService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.quizapp.dto.ApiResponse;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final ObjectMapper objectMapper;

    @PostMapping("/api/ai/simple-quiz")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> generateQuiz(@RequestBody QuizRequest req) {
        String aiResponse = aiService.generateQuiz(req.getSubject(), req.getDifficulty());
        return ResponseEntity.ok(ApiResponse.success(aiResponse, "AI Quiz Generated"));
    }

    @PostMapping("/explain-mistake")
    public ResponseEntity<ApiResponse<String>> explain(@RequestBody ExplainRequest req) {
        String aiResponse = aiService.explainAnswer(req.getQuestion(), req.getCorrectAnswer(), req.getUserAnswer());
        return ResponseEntity.ok(ApiResponse.success(aiResponse, "AI Explanation Generated"));
    }
    
    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<String>> feedback(@RequestBody FeedbackRequest req) {
        String aiResponse = aiService.generateFeedback(req.getProfileJson());
        return ResponseEntity.ok(ApiResponse.success(aiResponse, "AI Feedback Generated"));
    }

    @PostMapping("/generate-neural-quiz")
    public ResponseEntity<ApiResponse<Object>> generateNeuralQuiz(@RequestBody NeuralQuizRequest req) {
        try {
            String aiResponse = aiService.generateNeuralQuiz(req.getSubject(), req.getConcept(), req.getPersona());
            Object json = objectMapper.readValue(aiResponse, Object.class);
            return ResponseEntity.ok(ApiResponse.success(json, "Neural Quiz Generated"));
        } catch (Exception e) {
            try {
                String fallbackJson = String.format("""
                [
                  {
                    "id": "Q1",
                    "questionText": "What is the primary key requirement of BCNF for a relation R?",
                    "options": [
                      "For every non-trivial functional dependency X -> Y, X must be a superkey",
                      "All attributes must be prime attributes",
                      "No transitive dependencies are allowed",
                      "Every non-prime attribute must be fully dependent on the primary key"
                    ],
                    "correctIdx": 0,
                    "realTimeHelp": {
                      "progressiveHint": "BCNF is a stricter form of 3NF. Think about what constraint it places on the determinant X.",
                      "distractorAnalysis": [
                        "Correct: X must be a superkey in BCNF.",
                        "Incorrect: This is not a requirement of BCNF.",
                        "Incorrect: This describes 3NF.",
                        "Incorrect: This describes 2NF."
                      ]
                    }
                  },
                  {
                    "id": "Q2",
                    "questionText": "Which functional dependency violates BCNF if R(A, B, C) has candidate keys {A} and {B, C}?",
                    "options": [
                      "A -> B",
                      "B -> C where B is not a superkey",
                      "A -> C",
                      "B, C -> A"
                    ],
                    "correctIdx": 1,
                    "realTimeHelp": {
                      "progressiveHint": "Identify which dependency's left-hand side is NOT a candidate key/superkey.",
                      "distractorAnalysis": [
                        "Incorrect: A is a candidate key, so A -> B does not violate BCNF.",
                        "Correct: B is not a superkey, so B -> C violates BCNF.",
                        "Incorrect: A is a candidate key, so A -> C does not violate BCNF.",
                        "Incorrect: B, C is a candidate key, so B,C -> A does not violate BCNF."
                      ]
                    }
                  }
                ]
                """);
                Object json = objectMapper.readValue(fallbackJson, Object.class);
                return ResponseEntity.ok(ApiResponse.success(json, "Neural Quiz Generated (Failsafe Fallback)"));
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body(ApiResponse.error("FAILED_TO_GENERATE", "AI failed: " + e.getMessage()));
            }
        }
    }

    @PostMapping("/synthesize-cognitive-analysis")
    public ResponseEntity<ApiResponse<String>> synthesizeCognitiveAnalysis(@RequestBody CognitiveAnalysisRequest req) {
        try {
            String aiResponse = aiService.synthesizeCognitiveAnalysis(
                    req.getSubjectKey(),
                    req.getTargetNode(),
                    req.getQuestionText(),
                    req.getSelectedOptionText(),
                    req.getCorrectOptionText(),
                    req.getTimeSpentSeconds()
            );
            return ResponseEntity.ok(ApiResponse.success(aiResponse, "Cognitive Analysis Generated"));
        } catch (Exception e) {
            String fallbackAnalysis = String.format("""
            [ COGNITIVE GAP DIAGNOSIS ]
            The student selected the distractor: "%s". This suggests a conceptual gap in distinguishing standard normal forms (like 3NF) from BCNF, where every determinant must be a superkey.
            
            [ CRITICAL SUB-TOPIC REMEDIAL TRACE ]
            Recall the rule for BCNF: A relation R is in BCNF if, for every functional dependency X -> Y, X is a superkey of R. Unlike 3NF, BCNF does not allow Y to be a prime attribute if X is not a superkey.
            
            [ IMMEDIATE ACTIONABLE SPRINT STEP ]
            Verify the left-hand side (X) of all functional dependencies. If any X is not a superkey, the relation violates BCNF. Try decomposing the relation R into R1(X, Y) and R2(R - Y).
            """, req.getSelectedOptionText());
            return ResponseEntity.ok(ApiResponse.success(fallbackAnalysis, "Cognitive Analysis Generated (Failsafe Fallback)"));
        }
    }

    @Data
    static class QuizRequest {
        private String subject;
        private String difficulty;
    }

    @Data
    static class ExplainRequest {
        private String question;
        private String correctAnswer;
        private String userAnswer;
        private String topic;
    }
    
    @Data
    static class FeedbackRequest {
        private String profileJson;
    }

    @Data
    static class NeuralQuizRequest {
        private String subject;
        private String concept;
        private String persona;
    }

    @Data
    static class CognitiveAnalysisRequest {
        private String subjectKey;
        private String targetNode;
        private String questionText;
        private String selectedOptionText;
        private String correctOptionText;
        private Integer timeSpentSeconds;
    }
}
