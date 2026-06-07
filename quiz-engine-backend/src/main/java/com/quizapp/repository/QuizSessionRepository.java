package com.quizapp.repository;

import com.quizapp.entity.QuizSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QuizSessionRepository extends JpaRepository<QuizSessionEntity, Long> {
    Optional<QuizSessionEntity> findBySessionId(String sessionId);
}
