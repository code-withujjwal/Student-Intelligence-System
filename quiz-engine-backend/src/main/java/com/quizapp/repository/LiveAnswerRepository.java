package com.quizapp.repository;

import com.quizapp.entity.LiveAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LiveAnswerRepository extends JpaRepository<LiveAnswerEntity, Long> {
    Long countByParticipantUsername(String username);
    Long countByParticipantUsernameAndIsCorrectTrue(String username);
    
    List<LiveAnswerEntity> findByParticipantUsername(String username);
    
    @Query("SELECT la FROM LiveAnswerEntity la WHERE la.participant.username = :username ORDER BY la.submittedAt DESC")
    List<LiveAnswerEntity> findRecentAnswersByUsername(@Param("username") String username);
}
