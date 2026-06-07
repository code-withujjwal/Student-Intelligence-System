package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "daily_challenge_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyChallengeAttemptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private DailyChallengeEntity challenge;

    private boolean isCorrect;
    
    private Integer selectedOptionIdx;
    
    @Builder.Default
    private Integer attemptCount = 0;

    @CreationTimestamp
    private LocalDateTime attemptedAt;
}
