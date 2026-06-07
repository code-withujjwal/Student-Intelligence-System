package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SecurityLogDTO {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String concernType;
    private String description;
    private String severity;
    private String timestamp;
}
