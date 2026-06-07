package com.quizapp.service;

import com.quizapp.entity.AchievementEntity;
import com.quizapp.entity.UserEntity;
import com.quizapp.repository.AchievementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;

    @Transactional
    public void evaluateAchievements(UserEntity user, int quizzesCompleted, double avgAccuracy) {
        if (quizzesCompleted == 1 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "FIRST_QUIZ")) {
            unlock(user, "FIRST_QUIZ", "Completed your very first quiz!");
        }
        
        if (quizzesCompleted >= 10 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "TEN_QUIZZES")) {
            unlock(user, "TEN_QUIZZES", "Completed 10 quizzes. You're on fire!");
        }

        if (avgAccuracy >= 90.0 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "HIGH_ACHIEVER")) {
            unlock(user, "HIGH_ACHIEVER", "Maintained an accuracy of 90% or higher.");
        }
    }

    @Transactional
    public void evaluateAndUnlockAchievements(UserEntity user) {
        int level = (int) (Math.floor((user.getXp() == null ? 0L : user.getXp()) / 1000.0) + 1);

        if (level >= 1 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "TIER_01")) {
            unlock(user, "TIER_01", "LOGIC CADET: Foundational syntax patterns compiled. Systems online.");
        }
        if (level >= 6 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "TIER_02")) {
            unlock(user, "TIER_02", "STACK ARBITER: Successfully calibrated sequential stacks, pointers, and queues.");
        }
        if (level >= 11 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "TIER_03")) {
            unlock(user, "TIER_03", "REMEDIATION REAPER: Isolates and systematically obliterates concept vulnerabilities.");
        }
        if (level >= 16 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "TIER_04")) {
            unlock(user, "TIER_04", "ALGORITHMIC VISCOUNT: Maintains balanced multi-subject cross-compilation execution.");
        }
        if (level >= 21 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "TIER_05")) {
            unlock(user, "TIER_05", "VELOCITY KERNEL: Achieved absolute cognitive velocity. Resolves complex nodes under 15s.");
        }
        if (level >= 26 && !achievementRepository.existsByUserIdAndBadgeName(user.getId(), "TIER_06")) {
            unlock(user, "TIER_06", "SYSTEM ARCHITECT: Peak cognitive optimization. Full network control established.");
        }
    }

    private void unlock(UserEntity user, String badge, String desc) {
        AchievementEntity a = new AchievementEntity();
        a.setUser(user);
        a.setBadgeName(badge);
        a.setDescription(desc);
        achievementRepository.save(a);
        // Ideally, we could fire a WebSocket notification here
    }
}
