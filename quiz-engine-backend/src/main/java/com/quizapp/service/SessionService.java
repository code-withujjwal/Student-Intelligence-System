package com.quizapp.service;

import com.quizapp.entity.UserSession;
import com.quizapp.entity.UserEntity;
import com.quizapp.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final UserSessionRepository sessionRepository;

    @Transactional
    public String createSession(UserEntity user, String deviceMetadata) {
        String refreshToken = UUID.randomUUID().toString();
        
        UserSession session = UserSession.builder()
                .id(refreshToken)
                .userId(user.getId())
                .userAgent(deviceMetadata)
                .createdAt(LocalDateTime.now())
                .build();
                
        sessionRepository.save(session);
        return refreshToken;
    }

    public UserSession validateAndGetSession(String refreshToken) {
        return sessionRepository.findById(refreshToken).orElse(null);
    }

    @Transactional
    public void invalidateSession(String refreshToken) {
        sessionRepository.deleteById(refreshToken);
    }

    @Transactional
    public void invalidateAllUserSessions(Long userId) {
        sessionRepository.deleteByUserId(userId);
    }
}
