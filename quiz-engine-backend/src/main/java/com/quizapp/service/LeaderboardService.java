package com.quizapp.service;

import com.quizapp.dto.LeaderboardEntryDTO;
import com.quizapp.entity.UserEntity;
import com.quizapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;

    @Cacheable(value = "leaderboard", key = "#limit")
    public List<LeaderboardEntryDTO> getTopUsers(int limit) {
        List<UserEntity> topUsers = userRepository.findTopUsers(PageRequest.of(0, limit));
        
        List<LeaderboardEntryDTO> leaderboard = new ArrayList<>();
        int rank = 1;
        
        for (UserEntity user : topUsers) {
            LeaderboardEntryDTO entry = new LeaderboardEntryDTO();
            entry.setRank(rank++);
            entry.setUsername(user.getActualUsername() != null && !user.getActualUsername().isEmpty() ? user.getActualUsername() : user.getEmail());
            entry.setXp(user.getXp() != null ? user.getXp() : 0L);
            
            long easy = user.getEasySolvedCount() != null ? user.getEasySolvedCount() : 0L;
            long medium = user.getMediumSolvedCount() != null ? user.getMediumSolvedCount() : 0L;
            long hard = user.getHardSolvedCount() != null ? user.getHardSolvedCount() : 0L;
            entry.setQuestionsSolved(easy + medium + hard);
            
            entry.setDailyChallengeScore(user.getDailyChallengeScore() != null ? user.getDailyChallengeScore() : 0L);
            entry.setLevel((int) (Math.floor(entry.getXp() / 1000.0) + 1));
            entry.setStreak(0L); // Default streak
            
            leaderboard.add(entry);
        }

        return leaderboard;
    }
}
