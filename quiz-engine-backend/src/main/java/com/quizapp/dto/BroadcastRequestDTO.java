package com.quizapp.dto;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class BroadcastRequestDTO {
    private String type;
    private String target;
    private String targetValue;
    private String title;
    private String message;
}
