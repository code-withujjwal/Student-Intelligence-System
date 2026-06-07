package com.quizapp.repository;

import com.quizapp.entity.DailyChallengeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DailyChallengeRepository extends JpaRepository<DailyChallengeEntity, Long> {
    Optional<DailyChallengeEntity> findFirstByActiveTrueOrderByCreatedAtDesc();
    Optional<DailyChallengeEntity> findFirstByDifficultyAndActiveTrueOrderByCreatedAtDesc(String difficulty);
    Optional<DailyChallengeEntity> findFirstByDifficultyOrderByCreatedAtDesc(String difficulty);
}
