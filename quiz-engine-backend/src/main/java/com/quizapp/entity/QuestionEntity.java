package com.quizapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Getter @Setter
public class QuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String publicId;

    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @NotBlank
    private String questionType;

    private String department;
    private String subject;
    
    @NotBlank
    private String difficulty;
    
    @NotBlank
    private String status;

    private Double marks = 1.0;
    private Double negativeMarks = 0.0;

    @Column(columnDefinition = "JSON")
    private String metadata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionOptionEntity> options = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;
}
