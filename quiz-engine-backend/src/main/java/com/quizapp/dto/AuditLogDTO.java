package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditLogDTO {
    private Long id;
    private String username;
    private String action;
    private String metadata;
    private String timestamp;
}
