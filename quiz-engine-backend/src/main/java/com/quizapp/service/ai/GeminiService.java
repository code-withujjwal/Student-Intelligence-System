package com.quizapp.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.Map;
import java.util.List;
import java.util.Random;

@Service
public class GeminiService implements AIService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GeminiService(@Value("${gemini.api.key:}") String apiKey, ObjectMapper objectMapper) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("mock_key_for_dev")) {
            String sysKey = System.getProperty("GEMINI_API_KEY");
            if (sysKey == null || sysKey.isEmpty()) {
                sysKey = System.getenv("GEMINI_API_KEY");
            }
            if (sysKey == null || sysKey.isEmpty()) {
                sysKey = System.getenv("VITE_GEMINI_API_KEY");
            }
            if (sysKey == null || sysKey.isEmpty()) {
                sysKey = System.getProperty("VITE_GEMINI_API_KEY");
            }
            if (sysKey != null && !sysKey.isEmpty()) {
                apiKey = sysKey;
            }
        }
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }

    @Override
    public String generateQuiz(String subject, String difficulty) {
        String prompt = String.format("""
        Generate a university-level quiz with exactly 5 questions.
        Subject: %s
        Difficulty: %s
        Return ONLY valid JSON format:
        [
          {
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "explanation": "..."
          }
        ]
        Do not include markdown formatting like ```json.
        """, subject, difficulty);

        return callGemini(prompt);
    }

    @Override
    @Cacheable(value = "explanations", key = "'ai:explain:' + #question.hashCode() + ':' + #userAnswer.hashCode()")
    public String explainAnswer(String question, String correctAnswer, String userAnswer) {
        if (question == null || question.trim().isEmpty() || userAnswer == null || userAnswer.trim().isEmpty()) {
            return "Cannot generate an explanation for an empty question or answer.";
        }
        
        String prompt = String.format("""
        You are an expert computer science tutor.
        Explain why the student's answer is wrong and teach the correct concept clearly.

        Question: %s
        Correct Answer: %s
        Student Answer: %s

        Rules:
        - Keep explanation simple
        - Use step-by-step reasoning
        - Focus on concept gap
        - Be encouraging but precise
        """, question, correctAnswer, userAnswer);

        return callGemini(prompt);
    }

    @Override
    public String generateFeedback(String studentProfileJson) {
        String prompt = String.format("""
        Analyze the following student performance profile JSON:
        %s
        
        Give a 2-sentence highly specific study recommendation based on their weakest topics.
        """, studentProfileJson);

        return callGemini(prompt);
    }

    @Override
    public String generateNeuralQuiz(String subject, String concept, String persona) {
        String prompt = String.format("""
        You are an elite, adaptive engineering evaluator. Create a proctored dynamic assessment for target nodeId: "%s" under subject: "%s".
        The assessment is calibrated for the selected exam profile (personaMode: "%s").

        Generate exactly 5 advanced, algorithmic multiple-choice questions.

        Crucially, each question object must include:
        1. "id": e.g., "Q1", "Q2", etc.
        2. "questionText": The text of the question.
        3. "options": An array of exactly 4 choices.
        4. "correctIdx": The 0-based index of the correct option.
        5. "realTimeHelp": An object containing:
           - "progressiveHint": A progressive contextual hint string that scaffolds learning if the student gets stuck without revealing the answer.
           - "distractorAnalysis": An array of exactly 4 strings, where each element is an explicit plain-text explanation of the underlying logic flaw that each option (distractor) represents for the student.

        Strict Format Restriction: Output ONLY a raw, parsable JSON array. Do NOT include markdown tags like ```json or any conversational text. Follow this schema exactly:
        [
          {
            "id": "Q1",
            "questionText": "...",
            "options": ["...", "...", "...", "..."],
            "correctIdx": 2,
            "realTimeHelp": {
              "progressiveHint": "...",
              "distractorAnalysis": ["...", "...", "...", "..."]
            }
          }
        ]
        """, concept, subject, persona);

        String response = callGemini(prompt);
        response = response.replaceAll("```json", "").replaceAll("```", "").trim();
        return response;
    }

    @Override
    public String synthesizeCognitiveAnalysis(String subjectKey, String targetNode, String questionText, String selectedOptionText, String correctOptionText, Integer timeSpentSeconds) {
        String prompt = String.format("""
        You are a hyper-personalized computer science coach performing Cognitive Failure Profiling.
        Perform a diagnostic analysis of a student's answer selection:
        - Subject: %s
        - Concept Node: %s
        - Question: %s
        - Selected Option: %s
        - Correct Option: %s
        - Time Spent: %d seconds

        Provide your response as a clean, markdown-supported text response divided strictly into three uppercase console blocks:

        [ COGNITIVE GAP DIAGNOSIS ]
        Explain the exact semantic, logic, or architectural misunderstanding that led the student to pick that specific incorrect option, taking their timing behavior into account (e.g. if they answered very fast it might be guessing or a shallow heuristic, if slow it's a deep misconception).

        [ CRITICAL SUB-TOPIC REMEDIAL TRACE ]
        Break down the core foundational rule they need to review right now to patch this hole.

        [ IMMEDIATE ACTIONABLE SPRINT STEP ]
        Provide a direct, code-based practice drill or mental shortcut they can execute in under 2 minutes to verify they have understood the fix.
        """, subjectKey, targetNode, questionText, selectedOptionText, correctOptionText, timeSpentSeconds != null ? timeSpentSeconds : 0);

        return callGemini(prompt);
    }

    public String generateDailyChallenge(String difficulty) {
        String[] subjects = {"Data Structures", "Operating Systems", "Database Systems", "Computer Networks", "Object Oriented Programming"};
        String subject = subjects[new Random().nextInt(subjects.length)];
        
        String prompt = String.format("""
        Generate an incredibly tough, conceptual, university-level Multiple Choice Question (MCQ).
        Subject: %s
        Difficulty: %s (LeetCode style but theoretical)
        
        Return ONLY valid JSON format with this exact structure:
        {
          "title": "A short, engaging title for the problem",
          "subject": "%s",
          "topic": "The specific sub-topic",
          "difficulty": "%s",
          "problemStatement": "A detailed, complex scenario or algorithm trace.",
          "constraints": ["Constraint 1", "Constraint 2"],
          "examples": ["Example 1: Input -> Output -> Explanation"],
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOptionIdx": 0,
          "explanation": "Detailed explanation of why the answer is correct and others are wrong."
        }
        Do not include markdown formatting like ```json.
        """, subject, difficulty, subject, difficulty);

        return callGemini(prompt);
    }

    public String generateBlueprint(String subject, String topic, String mode, String unit, String style, String notesText) {
        String prompt = String.format("""
        You are an academic course designer. Create a quiz blueprint (coverage breakdown) for:
        - Subject: %s
        - Topic Focus: %s
        - Mode: %s
        - Unit: %s
        - Style/Company: %s
        - Notes: %s

        Generate exactly 3 sub-topics or conceptual areas that should be covered in this quiz with their target coverage percentage (must sum to exactly 100).
        Return ONLY valid JSON format:
        {
          "coverage": {
            "Sub-Topic 1": 40,
            "Sub-Topic 2": 30,
            "Sub-Topic 3": 30
          }
        }
        Do not include markdown formatting like ```json.
        """, subject, topic, mode, unit, style, notesText != null ? notesText : "None");

        String res = callGemini(prompt);
        return res.replaceAll("```json", "").replaceAll("```", "").trim();
    }

    public String generateQuizQuestions(String subject, String topic, String mode, String unit, String style, String notesText, String difficulty, Integer questionCount, String approvedBlueprint) {
        String prompt = String.format("""
        You are an elite university evaluator. Generate a set of multiple-choice questions for:
        - Subject: %s
        - Topic Focus: %s
        - Mode: %s
        - Unit: %s
        - Company Style: %s
        - Notes context: %s
        - Difficulty level: %s
        - Question Count: %d
        - Target Blueprint Coverage: %s

        Important: If the Mode is 'INTERVIEW', generate subjective questions where 'options' is empty or null, and the 'answer' field holds the expected conceptual answer.
        Otherwise, generate multiple-choice questions with exactly 4 options.

        Return ONLY valid JSON format containing a "questions" array. Follow this schema exactly:
        {
          "questions": [
            {
              "type": "SINGLE_CHOICE",
              "question": "...",
              "options": ["A", "B", "C", "D"],
              "answer": "Option Text (must match exactly one of the options)",
              "explanation": "..."
            }
          ]
        }
        Do not include markdown formatting like ```json.
        """, subject, topic, mode, unit, style, notesText != null ? notesText : "None", difficulty, questionCount, approvedBlueprint != null ? approvedBlueprint : "Any");

        String res = callGemini(prompt);
        return res.replaceAll("```json", "").replaceAll("```", "").trim();
    }

    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("mock_key_for_dev")) {
            logger.error("[AI ERROR] Gemini API Key is missing or invalid. Set VITE_GEMINI_API_KEY in .env.local.");
            throw new RuntimeException("Gemini API Key missing");
        }

        String[] models = {"gemini-2.5-flash", "gemini-2.0-flash"};
        Exception lastException = null;

        for (String model : models) {
            int maxRetries = 3;
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    Map<String, Object> requestBody = Map.of(
                        "contents", List.of(
                            Map.of("parts", List.of(
                                Map.of("text", prompt)
                            ))
                        )
                    );

                    String responseStr = webClient.post()
                        .uri("/" + model + ":generateContent?key=" + apiKey)
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(20))
                        .block();

                    if (responseStr.contains("\"error\"") && responseStr.contains("\"message\"")) {
                        logger.warn("Gemini API returned an error object for model " + model + ": " + responseStr);
                        throw new RuntimeException("Gemini API error: " + responseStr);
                    }

                    JsonNode rootNode = objectMapper.readTree(responseStr);
                    JsonNode candidates = rootNode.path("candidates");
                    if (candidates.isArray() && candidates.size() > 0) {
                        JsonNode parts = candidates.get(0).path("content").path("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            return parts.get(0).path("text").asText().trim();
                        }
                    }
                    throw new RuntimeException("Unexpected response format: " + responseStr);

                } catch (Exception e) {
                    lastException = e;
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "";
                    logger.warn("Attempt " + attempt + " failed for model " + model + " with error: " + errorMsg);
                    
                    if (errorMsg.contains("404")) {
                        break;
                    }
                    
                    if (errorMsg.contains("429")) {
                        try {
                            Thread.sleep(3500);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                    } else {
                        try {
                            Thread.sleep(1000);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            }
        }

        throw new RuntimeException("Gemini generation failed after trying multiple models and retries. Last error: " + (lastException != null ? lastException.getMessage() : "Unknown error"), lastException);
    }
}
