package com.quizapp.service.ai;

import com.quizapp.dto.ai.AiQuizRequestDTO;
import com.quizapp.entity.*;
import com.quizapp.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiQuizGeneratorService {

    private final GeminiService geminiService;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    private String getApiKey() {
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
            return sysKey;
        }
        return apiKey;
    }

    public Map<String, Object> generateBlueprint(AiQuizRequestDTO request) {
        log.info("Generating AI Quiz Blueprint for subject: {}, mode: {}", request.getSubject(), request.getMode());
        
        String effectiveApiKey = getApiKey();
        boolean useGemini = (effectiveApiKey != null && !effectiveApiKey.isEmpty() && !effectiveApiKey.equals("mock_key_for_dev"));
        
        if (useGemini) {
            try {
                String response = geminiService.generateBlueprint(
                    request.getSubject(),
                    request.getTopic(),
                    request.getMode(),
                    request.getUnit(),
                    request.getStyle(),
                    request.getNotesText()
                );
                JsonNode root = objectMapper.readTree(response);
                if (root.has("coverage")) {
                    Map<String, Object> result = new HashMap<>();
                    Map<String, Integer> coverage = new HashMap<>();
                    JsonNode coverageNode = root.get("coverage");
                    Iterator<Map.Entry<String, JsonNode>> fields = coverageNode.fields();
                    while (fields.hasNext()) {
                        Map.Entry<String, JsonNode> field = fields.next();
                        coverage.put(field.getKey(), field.getValue().asInt());
                    }
                    result.put("coverage", coverage);
                    return result;
                }
            } catch (Exception e) {
                log.error("Failed to generate blueprint from Gemini, falling back to mock blueprint.", e);
            }
        }
        
        // Mock fallback
        Map<String, Object> fallback = new HashMap<>();
        Map<String, Integer> coverage = new HashMap<>();
        if ("PLACEMENT".equalsIgnoreCase(request.getMode())) {
            coverage.put("Dynamic Programming & Arrays", 40);
            coverage.put("Linked Lists & Stacks", 30);
            coverage.put("System Design Basics", 30);
        } else if ("INTERVIEW".equalsIgnoreCase(request.getMode())) {
            coverage.put("Processes & Scheduling", 40);
            coverage.put("Memory Management", 30);
            coverage.put("Deadlocks & Sync", 30);
        } else {
            coverage.put("Core concepts of " + request.getSubject(), 40);
            coverage.put("Analytical reasoning", 30);
            coverage.put("Practical implementations", 30);
        }
        fallback.put("coverage", coverage);
        return fallback;
    }

    @Transactional
    public Map<String, Object> generateQuizAndSave(AiQuizRequestDTO request, Authentication authentication) {
        log.info("Generating AI Quiz and saving to database for subject: {}, count: {}", request.getSubject(), request.getQuestionCount());
        
        Long userId = ((UserEntity) authentication.getPrincipal()).getId();
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"));

        int count = request.getQuestionCount() != null ? request.getQuestionCount() : 5;
        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM";
        String topic = request.getTopic() != null ? request.getTopic() : "General review";

        String effectiveApiKey = getApiKey();
        boolean useGemini = (effectiveApiKey != null && !effectiveApiKey.isEmpty() && !effectiveApiKey.equals("mock_key_for_dev"));
        List<Map<String, Object>> parsedQuestions = null;

        if (useGemini) {
            try {
                String blueprintStr = "Subject quiz default";
                String response = geminiService.generateQuizQuestions(
                    request.getSubject(),
                    topic,
                    request.getMode(),
                    request.getUnit(),
                    request.getStyle(),
                    request.getNotesText(),
                    difficulty,
                    count,
                    blueprintStr
                );
                
                JsonNode root = objectMapper.readTree(response);
                if (root.has("questions") && root.get("questions").isArray()) {
                    parsedQuestions = new ArrayList<>();
                    JsonNode qsNode = root.get("questions");
                    for (JsonNode qNode : qsNode) {
                        Map<String, Object> qMap = new HashMap<>();
                        qMap.put("type", qNode.path("type").asText("SINGLE_CHOICE"));
                        qMap.put("question", qNode.path("question").asText());
                        qMap.put("answer", qNode.path("answer").asText());
                        qMap.put("explanation", qNode.path("explanation").asText());
                        
                        List<String> options = new ArrayList<>();
                        if (qNode.has("options") && qNode.get("options").isArray()) {
                            for (JsonNode opt : qNode.get("options")) {
                                options.add(opt.asText());
                            }
                        }
                        qMap.put("options", options);
                        parsedQuestions.add(qMap);
                    }
                }
            } catch (Exception e) {
                log.error("Gemini quiz generation failed, falling back to mock generator.", e);
            }
        }

        // Rule-based / Mock fallback if Gemini fails
        if (parsedQuestions == null || parsedQuestions.isEmpty()) {
            parsedQuestions = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                Map<String, Object> qMap = new HashMap<>();
                qMap.put("type", "INTERVIEW".equalsIgnoreCase(request.getMode()) ? "SUBJECTIVE" : "SINGLE_CHOICE");
                qMap.put("question", "Template Question " + (i + 1) + " covering " + topic + "?");
                qMap.put("answer", "A");
                qMap.put("explanation", "Standard verification of the topic: " + topic);
                qMap.put("options", Arrays.asList("A", "B", "C", "D"));
                parsedQuestions.add(qMap);
            }
        }

        String quizTitle = "AI Generated: " + request.getSubject() + " (" + difficulty + ")";
        if (request.getMode() != null) {
            quizTitle = "AI " + request.getMode() + ": " + request.getSubject();
        }

        return saveQuizToDb(quizTitle, request.getSubject(), parsedQuestions, user, difficulty);
    }

    @Transactional
    public Map<String, Object> generateQuizFromPdf(MultipartFile file, String subject, String difficulty, Integer questionCount, Authentication authentication) {
        log.info("Generating AI Quiz from uploaded PDF file for subject: {}", subject);
        
        String notesText = "Extracted PDF contents";
        try {
            try (PDDocument document = PDDocument.load(file.getInputStream())) {
                PDFTextStripper pdfStripper = new PDFTextStripper();
                notesText = pdfStripper.getText(document);
                // Clamp text size to avoid prompt overflow
                if (notesText.length() > 6000) {
                    notesText = notesText.substring(0, 6000);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse PDF file text using PDFBox. Using fallback text.", e);
            notesText = "Failed to parse PDF document. Create standard conceptual questions instead.";
        }

        AiQuizRequestDTO request = new AiQuizRequestDTO();
        request.setSubject(subject);
        request.setDifficulty(difficulty);
        request.setQuestionCount(questionCount);
        request.setMode("PDF");
        request.setNotesText(notesText);

        return generateQuizAndSave(request, authentication);
    }

    private Map<String, Object> saveQuizToDb(String title, String subject, List<Map<String, Object>> questionsMap, UserEntity user, String difficulty) {
        QuizEntity quiz = new QuizEntity();
        quiz.setTitle(title);
        quiz.setDescription("AI Generated Assessment covering topic elements.");
        quiz.setSubject(subject);
        quiz.setStatus("PUBLISHED"); // Instantly active so it can be attempted!
        quiz.setTeacher(user);
        quiz.setDurationMinutes(questionsMap.size() * 3); // 3 minutes per question
        quiz.setMaxAttempts(1);
        quiz.setSettings("{\"durationMinutes\":" + (questionsMap.size() * 3) + ",\"visibility\":\"PUBLIC\",\"shuffleQuestions\":false,\"shuffleOptions\":false,\"showResultImmediately\":true,\"maxAttempts\":1}");

        // Create Section A
        QuizSectionEntity section = new QuizSectionEntity();
        section.setTitle("Section A - AI Evaluation");
        section.setSectionOrder(0);
        section.setQuiz(quiz);
        quiz.getSections().add(section);

        int idx = 0;
        for (Map<String, Object> qMap : questionsMap) {
            QuestionEntity question = new QuestionEntity();
            question.setPublicId("AI_" + UUID.randomUUID().toString().substring(0, 8));
            
            String qText = (String) qMap.getOrDefault("question", "Conceptual Question");
            question.setTitle(qText.length() > 100 ? qText.substring(0, 97) + "..." : qText);
            question.setQuestionText(qText);
            question.setQuestionType((String) qMap.getOrDefault("type", "SINGLE_CHOICE"));
            question.setSubject(subject);
            question.setDifficulty(difficulty != null ? difficulty : "MEDIUM");
            question.setStatus("PUBLISHED");
            question.setMarks(2.0);
            question.setNegativeMarks(0.0);
            // Serialize metadata as valid JSON Map, including explanation
            Map<String, Object> metadataMap = new HashMap<>();
            metadataMap.put("explanation", qMap.getOrDefault("explanation", ""));
            metadataMap.put("unit", 1);
            try {
                question.setMetadata(objectMapper.writeValueAsString(metadataMap));
            } catch (Exception e) {
                question.setMetadata("{\"explanation\":\"\"}");
            }
            question.setCreatedBy(user);

            // Add options robustly
            List<String> optionsText = (List<String>) qMap.get("options");
            String correctAnswer = (String) qMap.get("answer");
            if (optionsText != null && !optionsText.isEmpty()) {
                // Determine if there is an exact option match
                boolean hasCorrect = false;
                for (String optText : optionsText) {
                    if (optText.trim().equalsIgnoreCase(correctAnswer.trim())) {
                        hasCorrect = true;
                        break;
                    }
                }

                // If no exact match, see if correctAnswer specifies a letter (A, B, C, D) or index (0..3)
                int correctIdx = -1;
                if (!hasCorrect) {
                    String normAnswer = correctAnswer.trim().toUpperCase();
                    if (normAnswer.equals("A") || normAnswer.equals("OPTION A")) correctIdx = 0;
                    else if (normAnswer.equals("B") || normAnswer.equals("OPTION B")) correctIdx = 1;
                    else if (normAnswer.equals("C") || normAnswer.equals("OPTION C")) correctIdx = 2;
                    else if (normAnswer.equals("D") || normAnswer.equals("OPTION D")) correctIdx = 3;
                    else {
                        try {
                            int val = Integer.parseInt(normAnswer);
                            if (val >= 0 && val < optionsText.size()) {
                                correctIdx = val;
                            } else if (val >= 1 && val <= optionsText.size()) {
                                correctIdx = val - 1;
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }

                for (int i = 0; i < optionsText.size(); i++) {
                    String optText = optionsText.get(i);
                    QuestionOptionEntity option = new QuestionOptionEntity();
                    option.setQuestion(question);
                    option.setOptionText(optText);
                    
                    boolean isCorrect = false;
                    if (hasCorrect) {
                        isCorrect = optText.trim().equalsIgnoreCase(correctAnswer.trim());
                    } else if (correctIdx != -1) {
                        isCorrect = (i == correctIdx);
                    } else {
                        // Fallback: substring match
                        isCorrect = optText.toLowerCase().contains(correctAnswer.toLowerCase()) || 
                                    correctAnswer.toLowerCase().contains(optText.toLowerCase());
                    }
                    option.setIsCorrect(isCorrect);
                    question.getOptions().add(option);
                }

                // Ensure at least one option is marked correct
                boolean anyCorrect = question.getOptions().stream().anyMatch(QuestionOptionEntity::getIsCorrect);
                if (!anyCorrect && !question.getOptions().isEmpty()) {
                    question.getOptions().get(0).setIsCorrect(true);
                }
            } else {
                // Subjective/numerical format
                QuestionOptionEntity option = new QuestionOptionEntity();
                option.setQuestion(question);
                option.setOptionText(correctAnswer != null ? correctAnswer : "Expected answer details.");
                option.setIsCorrect(true);
                question.getOptions().add(option);
            }

            questionRepository.save(question);

            QuizQuestionEntity qq = new QuizQuestionEntity();
            qq.setSection(section);
            qq.setQuestion(question);
            qq.setQuestionOrder(idx++);
            qq.setMarksOverride(2.0);
            qq.setNegativeMarksOverride(0.0);
            section.getQuestions().add(qq);
        }

        QuizEntity savedQuiz = quizRepository.save(quiz);

        Map<String, Object> result = new HashMap<>();
        result.put("quizId", savedQuiz.getId());
        result.put("title", savedQuiz.getTitle());
        result.put("questionCount", questionsMap.size());
        return result;
    }
}
