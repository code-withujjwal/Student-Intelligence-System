package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "behavior_logs")
@Getter @Setter
public class BehaviorLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    private String actionType; // e.g., "QUESTION_ANSWERED", "QUESTION_SKIPPED"

    private String topic;

    private Double timeSpentSeconds;

    private Boolean isCorrect;

    private LocalDateTime timestamp = LocalDateTime.now();
}
