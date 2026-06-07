package com.quizapp.repository;

import com.quizapp.entity.QuizEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, Long> {
    Page<QuizEntity> findByStatus(String status, Pageable pageable);
    List<QuizEntity> findByTeacherId(Long teacherId);
}
