package com.quizapp.service;

import com.quizapp.dto.DailyChallengeDTO;
import com.quizapp.dto.DailyChallengeResultDTO;
import com.quizapp.dto.DailyChallengeSubmitDTO;
import com.quizapp.entity.DailyChallengeAttemptEntity;
import com.quizapp.entity.DailyChallengeEntity;
import com.quizapp.entity.UserEntity;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.DailyChallengeAttemptRepository;
import com.quizapp.repository.DailyChallengeRepository;
import com.quizapp.repository.UserRepository;
import com.quizapp.scheduler.DailyChallengeScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DailyChallengeService {

    private final DailyChallengeRepository challengeRepository;
    private final DailyChallengeAttemptRepository attemptRepository;
    private final UserRepository userRepository;
    private final DailyChallengeScheduler scheduler;

    private static final int MAX_ATTEMPTS = 1;

    public DailyChallengeDTO getActiveChallenge(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String preferredDifficulty = determineDifficulty(user);

        DailyChallengeEntity active = challengeRepository.findFirstByDifficultyAndActiveTrueOrderByCreatedAtDesc(preferredDifficulty)
                .orElseGet(() -> {
                    // Fallback if difficulty variant not found
                    return challengeRepository.findFirstByActiveTrueOrderByCreatedAtDesc()
                            .orElseGet(() -> {
                                // Fallback if NO active challenge found (failsafe)
                                return scheduler.generateChallengeForDifficulty(preferredDifficulty);
                            });
                });

        DailyChallengeDTO dto = new DailyChallengeDTO();
        dto.setId(active.getId());
        dto.setTitle(active.getTitle());
        dto.setProblemStatement(active.getProblemStatement());
        dto.setSubject(active.getSubject());
        dto.setTopic(active.getTopic());
        dto.setDifficulty(active.getDifficulty());
        dto.setOptions(active.getOptions());
        dto.setExpiresAt(active.getExpiresAt());
        
        long remaining = Duration.between(LocalDateTime.now(), active.getExpiresAt()).getSeconds();
        dto.setRemainingSeconds(Math.max(0, remaining));
        dto.setMaxAttempts(MAX_ATTEMPTS);

        Optional<DailyChallengeAttemptEntity> attemptOpt = attemptRepository.findByUserIdAndChallengeId(userId, active.getId());
        if (attemptOpt.isPresent()) {
            DailyChallengeAttemptEntity attempt = attemptOpt.get();
            dto.setAlreadyAttempted(attempt.isCorrect() || attempt.getAttemptCount() >= MAX_ATTEMPTS);
            dto.setPreviousResult(attempt.isCorrect());
            dto.setAttemptCount(attempt.getAttemptCount());
        } else {
            dto.setAlreadyAttempted(false);
            dto.setAttemptCount(0);
        }

        return dto;
    }

    private String determineDifficulty(UserEntity user) {
        long xp = user.getXp() != null ? user.getXp() : 0;
        if (xp < 1000) return "Easy";
        if (xp < 3000) return "Medium";
        return "Hard";
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "leaderboard", allEntries = true)
    public DailyChallengeResultDTO submitChallenge(Long userId, DailyChallengeSubmitDTO submitDTO) {
        DailyChallengeEntity challenge = challengeRepository.findById(submitDTO.getChallengeId())
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));

        if (!challenge.isActive() || challenge.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("This challenge has expired");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DailyChallengeAttemptEntity attempt = attemptRepository.findByUserIdAndChallengeId(userId, challenge.getId())
                .orElse(new DailyChallengeAttemptEntity(null, user, challenge, false, submitDTO.getSelectedOptionIdx(), 0, null));

        if (attempt.getAttemptCount() > 0) {
            throw new IllegalStateException("Attempt already used");
        }

        boolean isCorrect = challenge.getCorrectOptionIdx().equals(submitDTO.getSelectedOptionIdx());

        attempt.setCorrect(isCorrect);
        attempt.setSelectedOptionIdx(submitDTO.getSelectedOptionIdx());
        attempt.setAttemptCount(attempt.getAttemptCount() + 1);
        attemptRepository.save(attempt);

        long xpGained = 0;
        if (isCorrect) {
            // XP Scaling based on attempts
            if (attempt.getAttemptCount() == 1) xpGained = 300L;
            else if (attempt.getAttemptCount() == 2) xpGained = 150L;
            else xpGained = 50L;

            user.setXp((user.getXp() == null ? 0 : user.getXp()) + xpGained);
            user.setDailyChallengeScore((user.getDailyChallengeScore() == null ? 0 : user.getDailyChallengeScore()) + 1);
            user.setHardSolvedCount((user.getHardSolvedCount() == null ? 0 : user.getHardSolvedCount()) + 1);
            userRepository.save(user);
        }

        return DailyChallengeResultDTO.builder()
                .isCorrect(isCorrect)
                .correctOptionIdx(attempt.getAttemptCount() >= MAX_ATTEMPTS || isCorrect ? challenge.getCorrectOptionIdx() : null)
                .explanation(attempt.getAttemptCount() >= MAX_ATTEMPTS || isCorrect ? challenge.getExplanation() : null)
                .xpGained(xpGained)
                .attemptCount(attempt.getAttemptCount())
                .maxAttempts(MAX_ATTEMPTS)
                .hasMoreAttempts(!isCorrect && attempt.getAttemptCount() < MAX_ATTEMPTS)
                .build();
    }
}
