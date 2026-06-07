package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "attempt_answers")
@Getter @Setter
public class AttemptAnswerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttemptEntity attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionEntity question;

    @Column(name = "selected_option_ids", columnDefinition = "JSON")
    private String selectedOptionIds; // Stored as a serialized JSON array

    @Column(columnDefinition = "TEXT")
    private String textAnswer;

    private Boolean isCorrect;

    private Double marksAwarded = 0.0;

    private String status = "ANSWERED"; // ANSWERED, SKIPPED

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds = 0;
}
