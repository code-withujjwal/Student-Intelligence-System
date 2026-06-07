package com.quizapp.service;

import org.springframework.stereotype.Service;

@Service
public class ScoringEngine {

    public Double calculateScore(Boolean isCorrect, Double timeTakenSeconds, Double baseMarks) {
        if (!isCorrect) return 0.0;
        
        // Speed bonus formula
        // baseMarks + bonus for answering quickly (e.g., max 5 points for instant answer fading to 0 at 30 seconds)
        double speedBonus = 0.0;
        if (timeTakenSeconds < 30.0) {
            speedBonus = ((30.0 - timeTakenSeconds) / 30.0) * (baseMarks * 0.5); 
        }
        
        return baseMarks + speedBonus;
    }
}
