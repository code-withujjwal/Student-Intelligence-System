package com.quizapp.controller;

import com.quizapp.dto.AdaptiveProfileDTO;
import com.quizapp.dto.PredictionDTO;
import com.quizapp.entity.QuestionEntity;
import com.quizapp.service.AdaptiveQuizService;
import com.quizapp.service.PerformancePredictionService;
import com.quizapp.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/adaptive")
@RequiredArgsConstructor
public class AdaptiveLearningController {

    private final StudentProfileService profileService;
    private final AdaptiveQuizService quizService;
    private final PerformancePredictionService predictionService;

    @GetMapping("/profile/{studentId}")
    public ResponseEntity<AdaptiveProfileDTO> getProfile(@PathVariable Long studentId) {
        return ResponseEntity.ok(profileService.getProfile(studentId));
    }

    @GetMapping("/quiz/{studentId}")
    public ResponseEntity<List<QuestionEntity>> generateQuiz(@PathVariable Long studentId) {
        return ResponseEntity.ok(quizService.generateAdaptiveQuiz(studentId));
    }

    @GetMapping("/prediction/{studentId}")
    public ResponseEntity<PredictionDTO> getPrediction(@PathVariable Long studentId) {
        return ResponseEntity.ok(predictionService.predictPerformance(studentId));
    }
    
    @GetMapping("/recommendations/{studentId}")
    public ResponseEntity<Map<String, Object>> getRecommendations(@PathVariable Long studentId) {
        // Smart recommendation widget payload
        return ResponseEntity.ok(Map.of(
            "nextRecommendedQuiz", "Operating Systems - Deadlocks (Adaptive Module)",
            "topicsToRevise", List.of("Deadlocks", "Subnetting"),
            "difficultyUpgradeSuggestion", "HARD"
        ));
    }
}
