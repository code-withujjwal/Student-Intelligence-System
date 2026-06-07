package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDTO {
    private String username; // Handle
    private String email;
    private String role;
    
    private String fullName;
    private String institution;
    private String academicStatus;
    private String githubUrl;
    private String linkedinUrl;
    
    private Long easySolvedCount;
    private Long mediumSolvedCount;
    private Long hardSolvedCount;
    private Long xp;
}
