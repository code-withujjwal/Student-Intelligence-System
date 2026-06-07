package com.quizapp.service.ai;

public interface AIService {
    String generateQuiz(String subject, String difficulty);
    String explainAnswer(String question, String correctAnswer, String userAnswer);
    String generateFeedback(String studentProfileJson);
    String generateNeuralQuiz(String subject, String concept, String persona);
    String synthesizeCognitiveAnalysis(String subjectKey, String targetNode, String questionText, String selectedOptionText, String correctOptionText, Integer timeSpentSeconds);
}
