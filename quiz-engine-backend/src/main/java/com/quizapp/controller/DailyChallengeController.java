package com.quizapp.controller;

import com.quizapp.entity.UserEntity;

import com.quizapp.dto.ApiResponse;
import com.quizapp.dto.DailyChallengeDTO;
import com.quizapp.dto.DailyChallengeResultDTO;
import com.quizapp.dto.DailyChallengeSubmitDTO;
import com.quizapp.service.DailyChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/daily-challenge")
@RequiredArgsConstructor
public class DailyChallengeController {

    private final DailyChallengeService challengeService;

    @GetMapping
    public ResponseEntity<ApiResponse<DailyChallengeDTO>> getActiveChallenge(Authentication authentication) {
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        DailyChallengeDTO dto = challengeService.getActiveChallenge(userId);
        return ResponseEntity.ok(ApiResponse.success(dto, "Active challenge fetched successfully"));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<DailyChallengeResultDTO>> submitChallenge(
            Authentication authentication,
            @RequestBody DailyChallengeSubmitDTO submitDTO) {
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        DailyChallengeResultDTO result = challengeService.submitChallenge(userId, submitDTO);
        return ResponseEntity.ok(ApiResponse.success(result, "Challenge submitted successfully"));
    }
}
