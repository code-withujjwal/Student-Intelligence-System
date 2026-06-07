package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserDTO {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String branch;
    private String semester;
    private String role;
    private String status;
    private Double academicScore;
    private Double placementScore;
    private String lastActive;
}
