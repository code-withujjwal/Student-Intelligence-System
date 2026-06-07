package com.quizapp.repository;

import com.quizapp.entity.QuizAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttemptEntity, Long> {
    List<QuizAttemptEntity> findByUserId(Long userId);
    List<QuizAttemptEntity> findByUserIdAndQuizId(Long userId, Long quizId);
    List<QuizAttemptEntity> findByQuizIdIn(List<Long> quizIds);
}
