package com.quizapp.repository;

import com.quizapp.entity.DailyChallengeAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DailyChallengeAttemptRepository extends JpaRepository<DailyChallengeAttemptEntity, Long> {
    Optional<DailyChallengeAttemptEntity> findByUserIdAndChallengeId(Long userId, Long challengeId);
    boolean existsByUserIdAndChallengeId(Long userId, Long challengeId);
    java.util.List<DailyChallengeAttemptEntity> findByUserIdOrderByAttemptedAtDesc(Long userId);
}
