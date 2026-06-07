package com.quizapp.controller;

import com.quizapp.dto.*;
import com.quizapp.entity.UserEntity;
import com.quizapp.service.QuizAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PostMapping
    public ResponseEntity<ApiResponse<QuizAttemptDTO>> startAttempt(
            @RequestBody StartAttemptRequestDTO requestDTO,
            Authentication authentication) {
        
        Long userId;
        if (requestDTO.getUserId() != null && !requestDTO.getUserId().trim().isEmpty()) {
            try {
                userId = Long.parseLong(requestDTO.getUserId());
            } catch (NumberFormatException e) {
                userId = ((UserEntity) authentication.getPrincipal()).getId();
            }
        } else {
            userId = ((UserEntity) authentication.getPrincipal()).getId();
        }

        QuizAttemptDTO attempt = quizAttemptService.startAttempt(requestDTO.getQuizId(), userId);
        return ResponseEntity.ok(ApiResponse.success(attempt, "Attempt started successfully"));
    }

    @PutMapping("/{attemptId}/submit")
    public ResponseEntity<ApiResponse<DetailedResultDTO>> submitAttempt(
            @PathVariable Long attemptId,
            @RequestBody SubmitAttemptRequestDTO submitDTO) {
        
        DetailedResultDTO result = quizAttemptService.submitAttempt(attemptId, submitDTO.getAnswers());
        return ResponseEntity.ok(ApiResponse.success(result, "Quiz submitted successfully"));
    }

    @GetMapping("/{attemptId}/result")
    public ResponseEntity<ApiResponse<DetailedResultDTO>> getAttemptResult(
            @PathVariable Long attemptId) {
        
        DetailedResultDTO result = quizAttemptService.getAttemptResult(attemptId);
        return ResponseEntity.ok(ApiResponse.success(result, "Attempt result fetched successfully"));
    }
}
