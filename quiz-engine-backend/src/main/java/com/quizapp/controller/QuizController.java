package com.quizapp.controller;

import com.quizapp.dto.QuizRequestDTO;
import com.quizapp.dto.QuizResponseDTO;
import com.quizapp.service.QuizService;
import lombok.RequiredArgsConstructor;
import com.quizapp.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<QuizResponseDTO>> createQuiz(@RequestBody QuizRequestDTO dto) {
        return new ResponseEntity<>(ApiResponse.success(quizService.createQuiz(dto), "Quiz created successfully"), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizResponseDTO>>> getAllQuizzes() {
        return ResponseEntity.ok(ApiResponse.success(quizService.getAllQuizzes(), "Quizzes fetched"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponseDTO>> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizById(id), "Quiz fetched"));
    }
}
