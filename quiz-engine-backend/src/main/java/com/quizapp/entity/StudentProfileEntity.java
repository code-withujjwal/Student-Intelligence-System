package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "student_profiles")
@Getter @Setter
public class StudentProfileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(columnDefinition = "TEXT")
    private String weakAreas; // Stored as comma-separated or JSON

    @Column(columnDefinition = "TEXT")
    private String strongAreas;

    private String preferredDifficulty = "MEDIUM";
    
    private Double avgResponseTime = 0.0;

    @Column(columnDefinition = "TEXT")
    private String aiInsight;

    private Integer aiInsightLastQuizCount = 0;
}
