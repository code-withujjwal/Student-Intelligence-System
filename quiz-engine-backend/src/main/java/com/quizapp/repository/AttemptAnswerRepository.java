package com.quizapp.repository;

import com.quizapp.entity.AttemptAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswerEntity, Long> {
    List<AttemptAnswerEntity> findByAttemptId(Long attemptId);
    List<AttemptAnswerEntity> findByAttemptIdIn(List<Long> attemptIds);
}
