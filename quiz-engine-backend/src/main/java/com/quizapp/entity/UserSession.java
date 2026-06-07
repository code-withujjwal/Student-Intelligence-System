package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSession {

    @Id
    private String id; // This will store the session token/UUID

    @Column(nullable = false)
    private Long userId;

    private String userAgent;
    private String ipAddress;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
