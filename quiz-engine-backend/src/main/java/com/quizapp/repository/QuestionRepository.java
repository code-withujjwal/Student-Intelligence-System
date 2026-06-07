package com.quizapp.repository;

import com.quizapp.entity.QuestionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, Long> {
    Optional<QuestionEntity> findByPublicId(String publicId);
    java.util.List<QuestionEntity> findBySubject(String subject);
    Page<QuestionEntity> findByStatusAndSubject(String status, String subject, Pageable pageable);

    @Query("SELECT q FROM QuestionEntity q WHERE LOWER(q.questionText) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<QuestionEntity> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
