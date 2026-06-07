package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "daily_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyChallengeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String problemStatement;

    private String subject;
    private String topic;
    private String difficulty;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "daily_challenge_options", joinColumns = @JoinColumn(name = "challenge_id"))
    @Column(name = "option_text", columnDefinition = "TEXT")
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    private List<String> options;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "daily_challenge_constraints", joinColumns = @JoinColumn(name = "challenge_id"))
    @Column(name = "constraint_text", columnDefinition = "TEXT")
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    private List<String> constraints;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "daily_challenge_examples", joinColumns = @JoinColumn(name = "challenge_id"))
    @Column(name = "example_text", columnDefinition = "TEXT")
    @org.hibernate.annotations.Fetch(org.hibernate.annotations.FetchMode.SUBSELECT)
    private List<String> examples;

    private Integer correctOptionIdx;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    private boolean active;
}
