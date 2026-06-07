package com.quizapp.controller;

import com.quizapp.dto.ApiResponse;
import com.quizapp.dto.ai.AiQuizRequestDTO;
import com.quizapp.service.ai.AiQuizGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiQuizController {

    private final AiQuizGeneratorService aiQuizGeneratorService;

    @PostMapping("/blueprint")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateBlueprint(@RequestBody AiQuizRequestDTO request) {
        Map<String, Object> blueprint = aiQuizGeneratorService.generateBlueprint(request);
        return ResponseEntity.ok(ApiResponse.success(blueprint, "Quiz Blueprint Generated"));
    }

    @PostMapping("/generate-quiz")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateQuiz(
            @RequestBody AiQuizRequestDTO request,
            Authentication authentication) {
        Map<String, Object> result = aiQuizGeneratorService.generateQuizAndSave(request, authentication);
        return ResponseEntity.ok(ApiResponse.success(result, "Quiz Generated and Saved Successfully"));
    }

    @PostMapping("/pdf-to-quiz")
    public ResponseEntity<ApiResponse<Map<String, Object>>> pdfToQuiz(
            @RequestParam("file") MultipartFile file,
            @RequestParam("subject") String subject,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("questionCount") Integer questionCount,
            Authentication authentication) {
        Map<String, Object> result = aiQuizGeneratorService.generateQuizFromPdf(file, subject, difficulty, questionCount, authentication);
        return ResponseEntity.ok(ApiResponse.success(result, "PDF Quiz Generated and Saved Successfully"));
    }
}
