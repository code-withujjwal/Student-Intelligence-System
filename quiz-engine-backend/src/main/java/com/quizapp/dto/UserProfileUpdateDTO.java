package com.quizapp.dto;

import lombok.Data;

@Data
public class UserProfileUpdateDTO {
    private String username; // Handle
    private String fullName;
    private String institution;
    private String academicStatus;
    private String githubUrl;
    private String linkedinUrl;
    
}
