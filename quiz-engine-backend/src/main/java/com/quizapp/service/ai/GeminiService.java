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

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            logger.warn("Gemini generateQuiz failed. Using mock fallback.", e);
            return String.format("""
            [
              {
                "question": "Which of the following describes a key characteristic of Mutual Exclusion in the context of operating systems?",
                "options": [
                  "Only one process can use a resource at a time",
                  "Processes hold allocated resources while waiting for new ones",
                  "Resources cannot be forcibly retrieved from a process",
                  "A circular chain of processes exists where each process waits for a resource held by the next"
                ],
                "correctAnswer": "Only one process can use a resource at a time",
                "explanation": "Mutual exclusion specifies that at least one resource must be held in a non-shareable mode; only one process can use it at any given time."
              },
              {
                "question": "In the context of the %s subject, which concept is most fundamental to %s difficulty level analysis?",
                "options": [
                  "Optimal resource allocation and state verification",
                  "Static memory partitions without boundary registers",
                  "Single-threaded execution pipelines",
                  "Hierarchical page tables with direct physical indexing"
                ],
                "correctAnswer": "Optimal resource allocation and state verification",
                "explanation": "Solving problems at the %s level requires analyzing resource allocation states and verifying if a safe sequence exists."
              }
            ]
            """, subject, difficulty, difficulty);
        }
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

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            logger.warn("Gemini explainAnswer failed. Using mock fallback.", e);
            return String.format("""
            Let's analyze the question: "%s"
            
            You selected: "%s", but the correct answer is: "%s".
            
            1. **Conceptual Gap**: Your choice represents a common misconception. The correct answer "%s" is the optimal solution because it adheres to the core system rules and avoids logical deadlocks.
            2. **Step-by-Step Reason**: Verify the prerequisites of the question. When allocating resources or testing parameters, you must satisfy the mutual exclusion and safe-state criteria first.
            3. **Key Takeaway**: Make sure to carefully trace the execution path or parameter constraints in similar questions.
            """, question, userAnswer, correctAnswer, correctAnswer);
        }
    }

    @Override
    public String generateFeedback(String studentProfileJson) {
        String prompt = String.format("""
        Analyze the following student performance profile JSON:
        %s
        
        Give a 2-sentence highly specific study recommendation based on their weakest topics.
        """, studentProfileJson);

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            logger.warn("Gemini generateFeedback failed. Using mock fallback.", e);
            return "Based on your performance profile, prioritize reviewing resource allocation algorithms in Operating Systems (Deadlocks) and IP Subnetting in Computer Networks. Focus on tracing safety algorithms and addressing schemes before taking the next test.";
        }
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

        try {
            String response = callGemini(prompt);
            response = response.replaceAll("```json", "").replaceAll("```", "").trim();
            return response;
        } catch (Exception e) {
            logger.warn("Gemini generateNeuralQuiz failed. Using mock fallback.", e);
            return String.format("""
            [
              {
                "id": "Q1",
                "questionText": "For the concept '%s' in %s, which of the following is correct under %s rules?",
                "options": [
                  "Option A represents the primary logical formulation",
                  "Option B represents a sub-optimal heuristics match",
                  "Option C violates the boundary constraint",
                  "Option D introduces a memory leak"
                ],
                "correctIdx": 0,
                "realTimeHelp": {
                  "progressiveHint": "Look for the answer that strictly adheres to the standard definition of %s.",
                  "distractorAnalysis": [
                    "Correct: This is the mathematically sound definition.",
                    "Incorrect: This is a heuristic and fails in boundary cases.",
                    "Incorrect: Violates the constraint rule.",
                    "Incorrect: Introduces an architectural leak."
                  ]
                }
              }
            ]
            """, concept, subject, persona, concept);
        }
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

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            logger.warn("Gemini synthesizeCognitiveAnalysis failed. Using mock fallback.", e);
            return String.format("""
            [ COGNITIVE GAP DIAGNOSIS ]
            The student selected: "%s" instead of "%s" for concept "%s" in %s. This choice shows a tendency to bypass boundary verification, potentially due to answering in %d seconds.
            
            [ CRITICAL SUB-TOPIC REMEDIAL TRACE ]
            Review the formal definition of "%s". Remember that boundary check constraints must be validated before asserting state compatibility.
            
            [ IMMEDIATE ACTIONABLE SPRINT STEP ]
            Verify the logic: Write down the functional dependencies of the table or system state, and check if the left-hand side is a superkey.
            """, selectedOptionText, correctOptionText, targetNode, subjectKey, timeSpentSeconds != null ? timeSpentSeconds : 0, targetNode);
        }
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

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            logger.warn("Gemini generateDailyChallenge failed. Using mock fallback.", e);
            return String.format("""
            {
              "title": "B-Tree Node Split Analysis",
              "subject": "%s",
              "topic": "Storage Engine Indexing",
              "difficulty": "%s",
              "problemStatement": "What is the maximum number of key inserts required to cause a split in a B-Tree of order m containing n elements when keys are inserted in sorted order?",
              "constraints": ["order m >= 3", "elements n >= 1"],
              "examples": ["Example 1: order m=3, root splits when the third element is inserted."],
              "options": [
                "ceil(m/2) consecutive inserts",
                "m consecutive inserts",
                "m-1 consecutive inserts",
                "log(m) consecutive inserts"
              ],
              "correctOptionIdx": 1,
              "explanation": "A split occurs when a node exceeds its maximum capacity of m-1 keys, requiring m keys to trigger splits recursively upwards."
            }
            """, subject, difficulty);
        }
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

        try {
            String res = callGemini(prompt);
            return res.replaceAll("```json", "").replaceAll("```", "").trim();
        } catch (Exception e) {
            logger.warn("Gemini generateBlueprint failed. Using mock fallback.", e);
            return String.format("""
            {
              "coverage": {
                "Fundamental Theory of %s": 40,
                "Analytical Problems in %s": 30,
                "Applied Cases and Scenarios": 30
              }
            }
            """, topic, topic);
        }
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

        try {
            String res = callGemini(prompt);
            return res.replaceAll("```json", "").replaceAll("```", "").trim();
        } catch (Exception e) {
            logger.warn("Gemini generateQuizQuestions failed. Using mock fallback.", e);
            if ("INTERVIEW".equalsIgnoreCase(mode)) {
                return String.format("""
                {
                  "questions": [
                    {
                      "type": "SUBJECTIVE",
                      "question": "Explain the core mechanics of '%s' in the context of %s under %s difficulty constraints.",
                      "options": [],
                      "answer": "The core mechanic involves establishing thread bounds, verifying process synchronization, and validating that no boundary condition is violated.",
                      "explanation": "This subjective question tests the candidate's deep conceptual understanding of %s."
                    }
                  ]
                }
                """, topic, subject, difficulty, topic);
            } else {
                return String.format("""
                {
                  "questions": [
                    {
                      "type": "SINGLE_CHOICE",
                      "question": "Which of the following is a key requirement for standard '%s' execution?",
                      "options": [
                        "Verification of state variables at each state transition",
                        "Static initialization without parameter validation",
                        "Relying on external locks for all critical sections",
                        "Ignoring thread allocation limits"
                      ],
                      "answer": "Verification of state variables at each state transition",
                      "explanation": "Verifying state variables at each transition ensures that the system remains in a safe and deadlock-free configuration."
                    }
                  ]
                }
                """, topic);
            }
        }
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
