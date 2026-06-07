package com.quizapp.repository;

import com.quizapp.entity.AchievementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AchievementRepository extends JpaRepository<AchievementEntity, Long> {
    List<AchievementEntity> findByUserId(Long userId);
    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);
}
