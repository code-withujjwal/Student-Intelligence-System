package com.quizapp.repository;

import com.quizapp.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    List<UserSession> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
