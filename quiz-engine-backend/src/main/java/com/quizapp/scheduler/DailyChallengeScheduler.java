package com.quizapp.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.entity.DailyChallengeEntity;
import com.quizapp.repository.DailyChallengeRepository;
import com.quizapp.service.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DailyChallengeScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DailyChallengeScheduler.class);
    private final GeminiService geminiService;
    private final DailyChallengeRepository repository;
    private final ObjectMapper objectMapper;

    @PostConstruct
    public void initFirstChallenge() {
        if (repository.count() == 0) {
            logger.info("No daily challenges found. Initializing the first one on startup...");
            generateNewDailyChallenge();
        }
    }

    // Run every day at midnight (0 0 0 * * ?) or for testing every 24h
    // Since we are in development, let's run it daily, but also trigger it on startup if no active challenge exists.
    @Scheduled(cron = "0 0 0 * * ?") 
    public void generateNewDailyChallenge() {
        logger.info("Starting Daily Challenge rotation...");

        // 1. Deactivate current active challenges
        List<DailyChallengeEntity> activeChallenges = repository.findAll().stream()
                .filter(DailyChallengeEntity::isActive)
                .toList();
        
        for (DailyChallengeEntity challenge : activeChallenges) {
            challenge.setActive(false);
            repository.save(challenge);
            logger.info("Deactivated previous challenge ID: {}", challenge.getId());
        }

        // 2. Generate new challenges for each difficulty
        String[] difficulties = {"Easy", "Medium", "Hard"};
        for (String difficulty : difficulties) {
            generateChallengeForDifficulty(difficulty);
        }
    }

    public DailyChallengeEntity generateChallengeForDifficulty(String difficulty) {
        int maxRetries = 2; // Try once, then retry once more
        for (int i = 0; i < maxRetries; i++) {
            try {
                String jsonResponse = geminiService.generateDailyChallenge(difficulty);
                
                // Clean markdown json tags if Gemini returns them
                jsonResponse = jsonResponse.replaceAll("```json", "").replaceAll("```", "").trim();

                DailyChallengeEntity newChallenge = objectMapper.readValue(jsonResponse, DailyChallengeEntity.class);
                
                newChallenge.setCreatedAt(LocalDateTime.now());
                newChallenge.setExpiresAt(LocalDateTime.now().plusHours(24));
                newChallenge.setActive(true);
                newChallenge.setDifficulty(difficulty);

                repository.save(newChallenge);
                logger.info("Successfully generated and saved new Daily Challenge: {} ({})", newChallenge.getTitle(), difficulty);
                return newChallenge;
            } catch (Exception e) {
                logger.warn("Attempt {} failed to generate Daily Challenge {} via Gemini: {}", i + 1, difficulty, e.getMessage());
                if (i == maxRetries - 1) {
                    logger.error("All {} attempts failed for {}. Using DB fallback.", maxRetries, difficulty);
                    return createDbFallbackChallenge(difficulty);
                }
            }
        }
        return createDbFallbackChallenge(difficulty);
    }

    private DailyChallengeEntity createDbFallbackChallenge(String difficulty) {
        Optional<DailyChallengeEntity> lastChallenge = repository.findFirstByDifficultyOrderByCreatedAtDesc(difficulty);
        
        if (lastChallenge.isPresent()) {
            DailyChallengeEntity old = lastChallenge.get();
            DailyChallengeEntity fallback = DailyChallengeEntity.builder()
                .title(old.getTitle())
                .subject(old.getSubject())
                .topic(old.getTopic())
                .difficulty(old.getDifficulty())
                .problemStatement(old.getProblemStatement())
                .constraints(old.getConstraints())
                .examples(old.getExamples())
                .options(old.getOptions())
                .correctOptionIdx(old.getCorrectOptionIdx())
                .explanation(old.getExplanation())
                .active(true)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
            repository.save(fallback);
            logger.info("Saved DB fallback challenge for {}", difficulty);
            return fallback;
        } else {
            // Absolute last resort if DB is empty
            return createHardcodedFallbackChallenge(difficulty);
        }
    }

    private DailyChallengeEntity createHardcodedFallbackChallenge(String difficulty) {
        DailyChallengeEntity fallback = DailyChallengeEntity.builder()
                .title("System Fundamentals: " + difficulty)
                .subject("Computer Science")
                .topic("General")
                .difficulty(difficulty)
                .problemStatement("Which of the following precisely describes a deadlock condition in operating systems?")
                .constraints(List.of("Select the exact matching group of conditions"))
                .examples(List.of("Example 1: Processes waiting on each other indefinitely implies a deadlock if all 4 conditions are met."))
                .options(List.of(
                        "Mutual exclusion, hold and wait, no preemption, circular wait",
                        "High CPU usage by a single thread",
                        "Memory leak in the kernel space",
                        "A process running in an infinite loop"
                ))
                .correctOptionIdx(0)
                .explanation("The four Coffman conditions for deadlock are: mutual exclusion, hold and wait, no preemption, and circular wait.")
                .active(true)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
                
        repository.save(fallback);
        logger.info("Saved hardcoded fallback challenge for {}", difficulty);
        return fallback;
    }
}
