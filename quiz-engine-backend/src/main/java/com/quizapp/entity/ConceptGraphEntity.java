package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "concept_graphs")
@Getter @Setter
public class ConceptGraphEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String macroSubject; // e.g. "DBMS"

    @Column(nullable = false)
    private String microConcept; // e.g. "Normalization"

    @Column(nullable = false)
    private String subConcept; // e.g. "1NF"
    
    private Double baselineDifficulty = 1.0;
}
