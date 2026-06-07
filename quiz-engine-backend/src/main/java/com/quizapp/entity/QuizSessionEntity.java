package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_sessions", indexes = {
    @Index(name = "idx_quiz_session_id", columnList = "sessionId"),
    @Index(name = "idx_quiz_status", columnList = "status")
})
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@Getter @Setter
public class QuizSessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId = "default_tenant";

    @Column(nullable = false, unique = true)
    private String sessionId; // E.g., a short code like "XYZ-123"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private QuizEntity quiz;

    @Column(nullable = false)
    private String status = "WAITING"; // WAITING, LIVE, FINISHED

    private Integer currentQuestionIndex = -1;

    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}
