package com.quizapp.service;

import com.quizapp.entity.AuditLogEntity;
import com.quizapp.entity.UserEntity;
import com.quizapp.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void logAction(UserEntity user, String action, String metadata) {
        AuditLogEntity log = new AuditLogEntity();
        log.setUser(user);
        log.setAction(action);
        log.setMetadata(metadata);
        auditLogRepository.save(log);
    }

    public List<AuditLogEntity> getRecentLogs() {
        return auditLogRepository.findTop10ByOrderByTimestampDesc();
    }
}
