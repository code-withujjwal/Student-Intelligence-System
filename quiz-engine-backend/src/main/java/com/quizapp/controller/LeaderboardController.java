package com.quizapp.controller;

import com.quizapp.dto.ApiResponse;
import com.quizapp.dto.LeaderboardEntryDTO;
import com.quizapp.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDTO>>> getLeaderboard(
            @RequestParam(defaultValue = "100") int limit) {
        
        List<LeaderboardEntryDTO> leaderboard = leaderboardService.getTopUsers(limit);
        return ResponseEntity.ok(ApiResponse.success(leaderboard, "Leaderboard fetched successfully"));
    }
}
