package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "participants")
@Getter @Setter
public class ParticipantEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private QuizSessionEntity session;

    @Column(nullable = false)
    private String username;

    private Double score = 0.0;
    
    private Integer currentRank = 0;

    private Boolean isOnline = true;
    
    private LocalDateTime joinedAt = LocalDateTime.now();
}
