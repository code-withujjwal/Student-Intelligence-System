package com.quizapp.repository;

import com.quizapp.entity.ParticipantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<ParticipantEntity, Long> {
    List<ParticipantEntity> findBySessionSessionIdOrderByScoreDesc(String sessionId);
    Optional<ParticipantEntity> findBySessionSessionIdAndUsername(String sessionId, String username);
    List<ParticipantEntity> findByUsernameOrderByJoinedAtDesc(String username);
}
