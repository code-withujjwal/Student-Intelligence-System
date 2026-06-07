package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "live_answers")
@Getter @Setter
public class LiveAnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private ParticipantEntity participant;

    private Long questionId;
    
    private String submittedAnswer;
    
    private Boolean isCorrect;
    
    private Double pointsAwarded;
    
    private Double timeTakenSeconds;

    private LocalDateTime submittedAt = LocalDateTime.now();
}
