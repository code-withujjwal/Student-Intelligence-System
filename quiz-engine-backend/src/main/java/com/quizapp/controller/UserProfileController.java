package com.quizapp.controller;

import com.quizapp.dto.ApiResponse;
import com.quizapp.dto.UserProfileDTO;
import com.quizapp.dto.UserProfileUpdateDTO;
import com.quizapp.dto.UserAchievementsDTO;
import com.quizapp.dto.StudentIntelligenceDTO;
import com.quizapp.entity.UserEntity;
import com.quizapp.entity.StudentProfileEntity;
import com.quizapp.entity.QuizAttemptEntity;
import com.quizapp.entity.AttemptAnswerEntity;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.AchievementRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.AttemptAnswerRepository;
import com.quizapp.repository.StudentProfileRepository;
import com.quizapp.service.ai.GeminiService;
import com.quizapp.service.ReportExportService;
import com.quizapp.service.AchievementService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final GeminiService geminiService;
    private final ReportExportService reportExportService;
    private final AchievementService achievementService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserProfileDTO>> getProfile(Authentication authentication) {
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDTO profile = UserProfileDTO.builder()
                .username(user.getActualUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .institution(user.getInstitution())
                .academicStatus(user.getAcademicStatus())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .easySolvedCount(user.getEasySolvedCount())
                .mediumSolvedCount(user.getMediumSolvedCount())
                .hardSolvedCount(user.getHardSolvedCount())
                .xp(user.getXp())
                .build();

        return ResponseEntity.ok(ApiResponse.success(profile, "Profile fetched successfully"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateProfile(
            Authentication authentication,
            @RequestBody UserProfileUpdateDTO updateDTO) {
        
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (updateDTO.getUsername() != null) user.setUsername(updateDTO.getUsername());
        if (updateDTO.getFullName() != null) user.setFullName(updateDTO.getFullName());
        if (updateDTO.getInstitution() != null) user.setInstitution(updateDTO.getInstitution());
        if (updateDTO.getAcademicStatus() != null) user.setAcademicStatus(updateDTO.getAcademicStatus());
        if (updateDTO.getGithubUrl() != null) user.setGithubUrl(updateDTO.getGithubUrl());
        if (updateDTO.getLinkedinUrl() != null) user.setLinkedinUrl(updateDTO.getLinkedinUrl());

        userRepository.save(user);

        UserProfileDTO profile = UserProfileDTO.builder()
                .username(user.getActualUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .institution(user.getInstitution())
                .academicStatus(user.getAcademicStatus())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .easySolvedCount(user.getEasySolvedCount())
                .mediumSolvedCount(user.getMediumSolvedCount())
                .hardSolvedCount(user.getHardSolvedCount())
                .xp(user.getXp())
                .build();

        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<UserAchievementsDTO>> getAchievements(Authentication authentication) {
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        long currentXP = user.getXp() != null ? user.getXp() : 0L;
        int level = (int) (Math.floor(currentXP / 1000.0) + 1);
        long nextLevelXP = level * 1000L;
        long levelStartXP = (level - 1) * 1000L;
        int pct = (int) (((currentXP - levelStartXP) * 100) / 1000);

        Map<String, Long> domainTokens = new HashMap<>();
        long easy = user.getEasySolvedCount() != null ? user.getEasySolvedCount() : 0L;
        long medium = user.getMediumSolvedCount() != null ? user.getMediumSolvedCount() : 0L;
        long hard = user.getHardSolvedCount() != null ? user.getHardSolvedCount() : 0L;

        domainTokens.put("DSA", Math.min(150L, easy * 15 + medium * 5 + 10));
        domainTokens.put("DBMS", Math.min(100L, medium * 20 + 5));
        domainTokens.put("OS", Math.min(80L, hard * 10 + 5));
        domainTokens.put("CN", Math.min(50L, medium * 5 + 5));
        domainTokens.put("OOP", Math.min(100L, easy * 10 + hard * 15 + 10));

        List<String> unlockedBadges = achievementRepository.findByUserId(userId).stream()
                .map(com.quizapp.entity.AchievementEntity::getBadgeName)
                .collect(Collectors.toList());

        // Auto unlock level-based badges if not already unlocked
        if (level >= 1 && !unlockedBadges.contains("TIER_01")) {
            unlockBadge(user, "TIER_01", "LOGIC CADET: Foundational syntax patterns compiled.");
            unlockedBadges.add("TIER_01");
        }
        if (level >= 6 && !unlockedBadges.contains("TIER_02")) {
            unlockBadge(user, "TIER_02", "STACK ARBITER: Successfully calibrated sequential stacks.");
            unlockedBadges.add("TIER_02");
        }
        if (level >= 11 && !unlockedBadges.contains("TIER_03")) {
            unlockBadge(user, "TIER_03", "REMEDIATION REAPER: Systematic concepts vulnerability obliteration.");
            unlockedBadges.add("TIER_03");
        }
        if (level >= 16 && !unlockedBadges.contains("TIER_04")) {
            unlockBadge(user, "TIER_04", "ALGORITHMIC VISCOUNT: Maintains balanced subject health.");
            unlockedBadges.add("TIER_04");
        }
        if (level >= 21 && !unlockedBadges.contains("TIER_05")) {
            unlockBadge(user, "TIER_05", "VELOCITY KERNEL: Flawless submission under limit.");
            unlockedBadges.add("TIER_05");
        }
        if (level >= 26 && !unlockedBadges.contains("TIER_06")) {
            unlockBadge(user, "TIER_06", "SYSTEM ARCHITECT: Peak performance achieved.");
            unlockedBadges.add("TIER_06");
        }

        UserAchievementsDTO dto = UserAchievementsDTO.builder()
                .currentLevel(level)
                .currentXP(currentXP)
                .nextLevelXP(nextLevelXP)
                .levelProgressPct(pct)
                .domainTokens(domainTokens)
                .unlockedBadges(unlockedBadges)
                .build();

        return ResponseEntity.ok(ApiResponse.success(dto, "Achievements fetched successfully"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Both currentPassword and newPassword are required", "VALIDATION_ERROR"));
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Current password is incorrect", "AUTH_ERROR"));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(ApiResponse.error("New password must be at least 8 characters", "VALIDATION_ERROR"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings(Authentication authentication) {
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> settings = new HashMap<>();
        // Return stored preferences from user entity (stored as separate fields or default values)
        settings.put("emailNotifications", true);
        settings.put("securityAlerts", true);
        settings.put("dailyReminders", false);
        settings.put("weeklyDigest", true);
        settings.put("achievementAlerts", true);
        settings.put("profilePublic", true);
        settings.put("showOnLeaderboard", true);
        settings.put("shareAnalytics", false);
        settings.put("difficultyPreference", "ADAPTIVE");
        settings.put("dailyGoalMinutes", 30);
        settings.put("preferredSubjects", new ArrayList<>());
        settings.put("username", user.getActualUsername());
        settings.put("email", user.getEmail());
        settings.put("fullName", user.getFullName());
        settings.put("institution", user.getInstitution());
        settings.put("role", user.getRole().name());
        settings.put("memberSince", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "Unknown");
        settings.put("xp", user.getXp() != null ? user.getXp() : 0);

        return ResponseEntity.ok(ApiResponse.success(settings, "Settings fetched"));
    }

    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            Authentication authentication,
            @RequestBody Map<String, String> body) {

        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        String confirmPassword = body.get("password");
        if (confirmPassword == null || !passwordEncoder.matches(confirmPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password confirmation failed", "AUTH_ERROR"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.success(null, "Account deleted successfully"));
    }

    private void unlockBadge(UserEntity user, String badgeName, String description) {
        com.quizapp.entity.AchievementEntity a = new com.quizapp.entity.AchievementEntity();
        a.setUser(user);
        a.setBadgeName(badgeName);
        a.setDescription(description);
        achievementRepository.save(a);
    }

    private String normalizeSubject(String subject) {
        if (subject == null) return "DSA";
        String s = subject.toUpperCase().trim();
        if (s.contains("DATA STRUCTURE") || s.contains("ALGORITHM") || s.contains("DSA")) return "DSA";
        if (s.contains("DATABASE") || s.contains("DBMS")) return "DBMS";
        if (s.contains("OPERATING SYSTEM") || s.contains("OS")) return "OS";
        if (s.contains("NETWORK") || s.contains("CN")) return "CN";
        if (s.contains("OBJECT") || s.contains("OOP") || s.contains("JAVA") || s.contains("C++")) return "OOPS";
        if (s.contains("ORGANIZATION") || s.contains("ARCHITECTURE") || s.contains("COA")) return "COA";
        if (s.contains("SOFTWARE") || s.contains("SE")) return "SE";
        if (s.contains("AUTOMATA") || s.contains("COMPUTATION") || s.contains("TOC")) return "TOC";
        return "DSA"; // default fallback
    }

    private String getLevelTitle(int level) {
        if (level < 10) return "Fresh Learner";
        if (level < 20) return "Knowledge Explorer";
        if (level < 30) return "Subject Specialist";
        if (level < 50) return "Problem Solver";
        return "Engineering Master";
    }

    private StudentIntelligenceDTO buildStudentIntelligenceDTO(UserEntity user) {
        Long userId = user.getId();
        StudentProfileEntity profile = studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfileEntity p = new StudentProfileEntity();
                    p.setUser(user);
                    p.setPreferredDifficulty("MEDIUM");
                    p.setAvgResponseTime(0.0);
                    p.setAiInsightLastQuizCount(0);
                    return studentProfileRepository.save(p);
                });

        List<QuizAttemptEntity> attempts = quizAttemptRepository.findByUserId(userId);
        List<QuizAttemptEntity> submittedAttempts = attempts.stream()
                .filter(a -> "SUBMITTED".equals(a.getStatus()))
                .collect(Collectors.toList());

        List<Long> submittedAttemptIds = submittedAttempts.stream()
                .map(QuizAttemptEntity::getId)
                .collect(Collectors.toList());

        List<AttemptAnswerEntity> answers = submittedAttemptIds.isEmpty() ? 
                new ArrayList<>() : attemptAnswerRepository.findByAttemptIdIn(submittedAttemptIds);

        long quizzesCompleted = submittedAttempts.size();
        long quizzesAttempted = attempts.size();

        long correctAnswersCount = answers.stream()
                .filter(ans -> ans.getIsCorrect() != null && ans.getIsCorrect())
                .count();
        long totalAnswersCount = answers.size();

        double averageAccuracy = totalAnswersCount == 0 ? 0.0 : 
                (correctAnswersCount * 100.0) / totalAnswersCount;
        averageAccuracy = Math.round(averageAccuracy * 10.0) / 10.0;

        double totalSeconds = answers.stream()
                .mapToDouble(ans -> ans.getTimeSpentSeconds() != null ? ans.getTimeSpentSeconds() : 0.0)
                .sum();
        double studyHours = Math.round((totalSeconds / 3600.0) * 10.0) / 10.0;

        Set<LocalDate> completedDates = submittedAttempts.stream()
                .filter(a -> a.getCompletedAt() != null)
                .map(a -> a.getCompletedAt().toLocalDate())
                .collect(Collectors.toSet());

        int currentStreak = 0;
        LocalDate checkDate = LocalDate.now();
        if (!completedDates.contains(checkDate) && completedDates.contains(checkDate.minusDays(1))) {
            checkDate = checkDate.minusDays(1);
        }
        while (completedDates.contains(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }

        Map<String, Integer> correctBySubject = new HashMap<>();
        Map<String, Integer> totalBySubject = new HashMap<>();
        String[] coreSubjects = {"DSA", "DBMS", "OS", "CN", "OOPS", "COA", "SE", "TOC"};
        for (String s : coreSubjects) {
            correctBySubject.put(s, 0);
            totalBySubject.put(s, 0);
        }

        for (AttemptAnswerEntity ans : answers) {
            String subject = ans.getQuestion().getSubject();
            if (subject == null) {
                subject = "DSA";
            }
            String normSubject = normalizeSubject(subject);
            if (correctBySubject.containsKey(normSubject)) {
                totalBySubject.put(normSubject, totalBySubject.get(normSubject) + 1);
                if (ans.getIsCorrect() != null && ans.getIsCorrect()) {
                    correctBySubject.put(normSubject, correctBySubject.get(normSubject) + 1);
                }
            }
        }

        List<StudentIntelligenceDTO.SubjectMasteryEntry> subjectMastery = new ArrayList<>();
        int subjectsMastered = 0;
        for (String s : coreSubjects) {
            int tot = totalBySubject.get(s);
            int corr = correctBySubject.get(s);
            int mastery = tot == 0 ? 0 : (corr * 100) / tot;
            if (mastery >= 85 && tot >= 3) {
                subjectsMastered++;
            }
            subjectMastery.add(StudentIntelligenceDTO.SubjectMasteryEntry.builder()
                    .subject(s)
                    .mastery(mastery)
                    .correctCount(corr)
                    .totalCount(tot)
                    .build());
        }

        long xp = user.getXp() != null ? user.getXp() : 0L;
        long globalRank = userRepository.countByXpGreaterThan(xp) + 1;
        long collegeRank = (user.getInstitution() == null || user.getInstitution().trim().isEmpty()) ? 
                globalRank : userRepository.countByInstitutionAndXpGreaterThan(user.getInstitution(), xp) + 1;
        long departmentRank = (user.getAcademicStatus() == null || user.getAcademicStatus().trim().isEmpty()) ? 
                globalRank : userRepository.countByAcademicStatusAndXpGreaterThan(user.getAcademicStatus(), xp) + 1;

        int level = (int) (Math.floor(xp / 1000.0) + 1);
        String title = getLevelTitle(level);

        Map<String, Long> dateCounts = submittedAttempts.stream()
                .filter(a -> a.getCompletedAt() != null)
                .collect(Collectors.groupingBy(a -> a.getCompletedAt().toLocalDate().toString(), Collectors.counting()));
        
        List<StudentIntelligenceDTO.HeatmapEntry> heatmapData = new ArrayList<>();
        for (Map.Entry<String, Long> entry : dateCounts.entrySet()) {
            heatmapData.add(StudentIntelligenceDTO.HeatmapEntry.builder()
                    .date(entry.getKey())
                    .count(entry.getValue().intValue())
                    .build());
        }

        achievementService.evaluateAndUnlockAchievements(user);
        
        if (correctBySubject.get("DBMS") >= 5 && (correctBySubject.get("DBMS") * 100.0) / totalBySubject.get("DBMS") >= 85.0) {
            if (!achievementRepository.existsByUserIdAndBadgeName(userId, "DBMS_EXPERT")) {
                unlockBadge(user, "DBMS_EXPERT", "DBMS EXPERT: Calibrated Relational Schema nodes above 85% accuracy.");
            }
        }
        if (correctBySubject.get("DSA") >= 5 && (correctBySubject.get("DSA") * 100.0) / totalBySubject.get("DSA") >= 85.0) {
            if (!achievementRepository.existsByUserIdAndBadgeName(userId, "DSA_NINJA")) {
                unlockBadge(user, "DSA_NINJA", "DSA NINJA: Peak efficiency in pointer manipulation and graph traversals.");
            }
        }
        if (currentStreak >= 10 && !achievementRepository.existsByUserIdAndBadgeName(userId, "STREAK_10")) {
            unlockBadge(user, "STREAK_10", "STREAK MASTER: Maintained a 10-day streak of continuous mental calibration.");
        }

        List<String> userUnlockedBadges = achievementRepository.findByUserId(userId).stream()
                .map(com.quizapp.entity.AchievementEntity::getBadgeName)
                .collect(Collectors.toList());

        List<StudentIntelligenceDTO.BadgeEntry> achievementsDTO = new ArrayList<>();
        Map<String, String[]> badgeDetails = new LinkedHashMap<>();
        badgeDetails.put("TIER_01", new String[]{"LOGIC CADET", "Foundational syntax patterns compiled. Systems online."});
        badgeDetails.put("TIER_02", new String[]{"STACK ARBITER", "Successfully calibrated sequential stacks, pointers, and queues."});
        badgeDetails.put("TIER_03", new String[]{"REMEDIATION REAPER", "Isolates and systematically obliterates concept vulnerabilities."});
        badgeDetails.put("TIER_04", new String[]{"ALGORITHMIC VISCOUNT", "Maintains balanced multi-subject cross-compilation execution."});
        badgeDetails.put("TIER_05", new String[]{"VELOCITY KERNEL", "Achieved absolute cognitive velocity. Resolves complex nodes under 15s."});
        badgeDetails.put("TIER_06", new String[]{"SYSTEM ARCHITECT", "Peak cognitive optimization. Full network control established."});
        badgeDetails.put("DBMS_EXPERT", new String[]{"DBMS EXPERT", "Calibrated Relational Schema nodes above 85% accuracy."});
        badgeDetails.put("DSA_NINJA", new String[]{"DSA NINJA", "Peak efficiency in pointer manipulation and graph traversals."});
        badgeDetails.put("STREAK_10", new String[]{"STREAK MASTER", "Maintained a 10-day streak of continuous mental calibration."});
        badgeDetails.put("FIRST_QUIZ", new String[]{"FIRST STEP", "Completed your very first quiz!"});

        for (Map.Entry<String, String[]> entry : badgeDetails.entrySet()) {
            boolean unlocked = userUnlockedBadges.contains(entry.getKey());
            achievementsDTO.add(StudentIntelligenceDTO.BadgeEntry.builder()
                    .id(entry.getKey())
                    .name(entry.getValue()[0])
                    .description(entry.getValue()[1])
                    .unlocked(unlocked)
                    .unlockedAt(unlocked ? "SYSTEM TIME RECORDED" : null)
                    .build());
        }

        List<StudentIntelligenceDTO.TimelineEntry> timeline = new ArrayList<>();
        if (user.getCreatedAt() != null) {
            timeline.add(StudentIntelligenceDTO.TimelineEntry.builder()
                    .date(user.getCreatedAt().toLocalDate().toString())
                    .title("Operative Recruited")
                    .description("Network identity created at " + (user.getInstitution().isEmpty() ? "Unknown" : user.getInstitution()))
                    .build());
        }
        for (com.quizapp.entity.AchievementEntity ach : achievementRepository.findByUserId(userId)) {
            timeline.add(StudentIntelligenceDTO.TimelineEntry.builder()
                    .date(ach.getUnlockedAt() != null ? ach.getUnlockedAt().toLocalDate().toString() : LocalDate.now().toString())
                    .title("Tactical Badge Unlocked")
                    .description(ach.getBadgeName() + ": " + ach.getDescription())
                    .build());
        }
        for (QuizAttemptEntity a : submittedAttempts) {
            if (a.getScore() != null && a.getQuiz() != null && a.getScore() >= 80.0) {
                timeline.add(StudentIntelligenceDTO.TimelineEntry.builder()
                        .date(a.getCompletedAt() != null ? a.getCompletedAt().toLocalDate().toString() : LocalDate.now().toString())
                        .title("Perfect Grid Score")
                        .description("Scored " + a.getScore() + " on " + a.getQuiz().getTitle())
                        .build());
            }
        }
        timeline.sort((t1, t2) -> t2.getDate().compareTo(t1.getDate()));

        double dsaAcc = totalBySubject.get("DSA") == 0 ? 0.0 : (correctBySubject.get("DSA") * 100.0) / totalBySubject.get("DSA");
        double dbmsAcc = totalBySubject.get("DBMS") == 0 ? 0.0 : (correctBySubject.get("DBMS") * 100.0) / totalBySubject.get("DBMS");
        double osAcc = totalBySubject.get("OS") == 0 ? 0.0 : (correctBySubject.get("OS") * 100.0) / totalBySubject.get("OS");
        double cnAcc = totalBySubject.get("CN") == 0 ? 0.0 : (correctBySubject.get("CN") * 100.0) / totalBySubject.get("CN");
        double oopsAcc = totalBySubject.get("OOPS") == 0 ? 0.0 : (correctBySubject.get("OOPS") * 100.0) / totalBySubject.get("OOPS");
        double coaAcc = totalBySubject.get("COA") == 0 ? 0.0 : (correctBySubject.get("COA") * 100.0) / totalBySubject.get("COA");
        double seAcc = totalBySubject.get("SE") == 0 ? 0.0 : (correctBySubject.get("SE") * 100.0) / totalBySubject.get("SE");
        double tocAcc = totalBySubject.get("TOC") == 0 ? 0.0 : (correctBySubject.get("TOC") * 100.0) / totalBySubject.get("TOC");

        double othersAvg = (coaAcc + seAcc + tocAcc) / 3.0;
        double placementScore = (dsaAcc * 0.35) + (dbmsAcc * 0.20) + (osAcc * 0.15) + (cnAcc * 0.10) + (oopsAcc * 0.10) + (othersAvg * 0.10);
        placementScore = Math.round(placementScore * 10.0) / 10.0;

        List<String> focusList = new ArrayList<>();
        if (dsaAcc < 70.0) focusList.add("Review Data Structures & Algorithms tree and graph traversals.");
        if (dbmsAcc < 70.0) focusList.add("Calibrate DBMS indexing algorithms and transactional isolation levels.");
        if (osAcc < 70.0) focusList.add("Synthesize Operating Systems virtual memory paging and CPU scheduling schemas.");
        if (cnAcc < 70.0) focusList.add("Debug Computer Networks TCP congestion control states and subnetting.");
        if (oopsAcc < 70.0) focusList.add("Calibrate Object Oriented principles like polymorphism and abstraction boundaries.");
        if (focusList.isEmpty()) {
            focusList.add("Synthesize cross-subject edge cases. Excellent baseline calibration detected.");
        }

        Map<String, Integer> knowledgeDNA = new HashMap<>();
        knowledgeDNA.put("problem_solving", Math.max(10, Math.min(100, (int) (dsaAcc * 0.8 + 10))));
        knowledgeDNA.put("theory", Math.max(10, Math.min(100, (int) ((osAcc + cnAcc + dbmsAcc) / 3.0))));
        double avgTime = profile.getAvgResponseTime() != null ? profile.getAvgResponseTime() : 0.0;
        int speedVal = avgTime == 0.0 ? 70 : (int) Math.max(10, Math.min(100, 100 - avgTime));
        knowledgeDNA.put("speed", speedVal);
        knowledgeDNA.put("consistency", Math.max(10, Math.min(100, currentStreak * 10 + 20)));
        knowledgeDNA.put("retention", Math.max(10, Math.min(100, (int) averageAccuracy)));

        List<StudentIntelligenceDTO.RecentActivityEntry> recentActivities = new ArrayList<>();
        submittedAttempts.stream()
                .sorted((a1, a2) -> a2.getCompletedAt().compareTo(a1.getCompletedAt()))
                .limit(5)
                .forEach(a -> {
                    recentActivities.add(StudentIntelligenceDTO.RecentActivityEntry.builder()
                            .type("QUIZ_COMPLETED")
                            .description("Completed quiz '" + a.getQuiz().getTitle() + "' with score: " + a.getScore())
                            .date(a.getCompletedAt().toLocalDate().toString())
                            .build());
                });

        achievementRepository.findByUserId(userId).stream()
                .sorted((a1, a2) -> {
                    if (a1.getUnlockedAt() != null && a2.getUnlockedAt() != null) {
                        return a2.getUnlockedAt().compareTo(a1.getUnlockedAt());
                    }
                    return 0;
                })
                .limit(3)
                .forEach(ach -> {
                    recentActivities.add(StudentIntelligenceDTO.RecentActivityEntry.builder()
                            .type("BADGE_UNLOCKED")
                            .description("Unlocked badge: " + ach.getBadgeName())
                            .date(ach.getUnlockedAt() != null ? ach.getUnlockedAt().toLocalDate().toString() : LocalDate.now().toString())
                            .build());
                });

        String aiInsight = profile.getAiInsight();
        if (aiInsight == null || aiInsight.trim().isEmpty() || profile.getAiInsightLastQuizCount() == null || 
                profile.getAiInsightLastQuizCount() < quizzesCompleted) {
            
            String contextJson = String.format(
                    "{\"level\": %d, \"completedQuizzes\": %d, \"streak\": %d, \"averageAccuracy\": %.1f, " +
                    "\"dsaAccuracy\": %.1f, \"dbmsAccuracy\": %.1f, \"osAccuracy\": %.1f, \"cnAccuracy\": %.1f, \"oopsAccuracy\": %.1f}",
                    level, quizzesCompleted, currentStreak, averageAccuracy, dsaAcc, dbmsAcc, osAcc, cnAcc, oopsAcc
            );
            try {
                aiInsight = geminiService.generateFeedback(contextJson);
                profile.setAiInsight(aiInsight);
                profile.setAiInsightLastQuizCount((int) quizzesCompleted);
                studentProfileRepository.save(profile);
            } catch (Exception e) {
                if (aiInsight == null || aiInsight.trim().isEmpty()) {
                    aiInsight = "System recalibrating AI analyzer. Focus on improving key conceptual accuracy across all active nodes.";
                }
            }
        }

        return StudentIntelligenceDTO.builder()
                .fullName(user.getFullName())
                .username(user.getActualUsername())
                .academicStatus(user.getAcademicStatus())
                .institution(user.getInstitution())
                .level(level)
                .xp(xp)
                .title(title)
                .globalRank(globalRank)
                .collegeRank(collegeRank)
                .departmentRank(departmentRank)
                .quizzesCompleted(quizzesCompleted)
                .quizzesAttempted(quizzesAttempted)
                .averageAccuracy(averageAccuracy)
                .currentStreak(currentStreak)
                .studyHours(studyHours)
                .subjectsMastered(subjectsMastered)
                .subjectMastery(subjectMastery)
                .heatmapData(heatmapData)
                .achievements(achievementsDTO)
                .timeline(timeline)
                .aiInsight(aiInsight)
                .placementReadinessScore(placementScore)
                .recommendedNextFocus(focusList)
                .recentActivities(recentActivities)
                .knowledgeDNA(knowledgeDNA)
                .build();
    }

    @GetMapping("/intelligence")
    public ResponseEntity<ApiResponse<StudentIntelligenceDTO>> getIntelligence(Authentication authentication) {
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudentIntelligenceDTO dto = buildStudentIntelligenceDTO(user);
        return ResponseEntity.ok(ApiResponse.success(dto, "Intelligence metrics aggregated successfully"));
    }

    @GetMapping("/report/{type}")
    public ResponseEntity<byte[]> getReport(Authentication authentication, @PathVariable String type) {
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        StudentIntelligenceDTO dto = buildStudentIntelligenceDTO(user);
        
        byte[] pdfBytes;
        if ("subject".equalsIgnoreCase(type)) {
            pdfBytes = reportExportService.generateSubjectReport(dto);
        } else if ("performance".equalsIgnoreCase(type)) {
            pdfBytes = reportExportService.generatePerformanceReport(dto);
        } else if ("placement".equalsIgnoreCase(type)) {
            pdfBytes = reportExportService.generatePlacementReport(dto);
        } else {
            pdfBytes = reportExportService.generateAcademicReport(dto);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", type + "_readiness_report.pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
