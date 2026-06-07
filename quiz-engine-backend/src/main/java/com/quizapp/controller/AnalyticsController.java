package com.quizapp.controller;

import com.quizapp.dto.ApiResponse;
import com.quizapp.dto.analytics.*;
import com.quizapp.entity.UserEntity;
import com.quizapp.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/platform")
    public ResponseEntity<Map<String, Object>> getPlatformAnalytics() {
        return ResponseEntity.ok(analyticsService.getPlatformAnalytics());
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<Map<String, Object>> getStudentAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(id));
    }

    @GetMapping("/teacher/{id}")
    public ResponseEntity<Map<String, Object>> getTeacherAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getTeacherAnalytics(id));
    }

    // --- New Progress API Endpoints --- //

    @GetMapping("/progress/overview")
    public ResponseEntity<ApiResponse<ProgressOverviewDTO>> getProgressOverview(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String username = user.getActualUsername() != null ? user.getActualUsername() : user.getEmail();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getProgressOverview(user.getId(), username), "Overview fetched"));
    }

    @GetMapping("/progress/subjects")
    public ResponseEntity<ApiResponse<List<SubjectAnalyticsDTO>>> getSubjectAnalytics(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String username = user.getActualUsername() != null ? user.getActualUsername() : user.getEmail();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getSubjectAnalytics(username), "Subjects fetched"));
    }

    @GetMapping("/progress/history")
    public ResponseEntity<ApiResponse<List<QuizHistoryDTO>>> getQuizHistory(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String username = user.getActualUsername() != null ? user.getActualUsername() : user.getEmail();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getQuizHistory(username), "History fetched"));
    }

    @GetMapping("/progress/daily-challenges")
    public ResponseEntity<ApiResponse<DailyChallengeAnalyticsDTO>> getDailyChallengeAnalytics(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDailyChallengeAnalytics(user.getId()), "Daily Challenges fetched"));
    }

    @GetMapping("/progress/topics")
    public ResponseEntity<ApiResponse<List<TopicMasteryDTO>>> getTopicMastery(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String username = user.getActualUsername() != null ? user.getActualUsername() : user.getEmail();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTopicMastery(username), "Topics fetched"));
    }

    @GetMapping("/progress/trends")
    public ResponseEntity<ApiResponse<List<PerformanceTrendDTO>>> getPerformanceTrends(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        String username = user.getActualUsername() != null ? user.getActualUsername() : user.getEmail();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPerformanceTrends(username), "Trends fetched"));
    }
}
