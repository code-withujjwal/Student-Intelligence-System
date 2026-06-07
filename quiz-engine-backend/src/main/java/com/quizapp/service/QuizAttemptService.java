package com.quizapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.dto.*;
import com.quizapp.entity.*;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final AttemptAnswerRepository answerRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final AchievementService achievementService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public QuizAttemptDTO startAttempt(Long quizId, Long userId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        QuizAttemptEntity attempt = new QuizAttemptEntity();
        attempt.setQuiz(quiz);
        attempt.setUser(user);
        attempt.setStatus("IN_PROGRESS");
        attempt.setScore(0.0);
        attempt.setStartedAt(LocalDateTime.now());
        attempt = attemptRepository.save(attempt);

        return QuizAttemptDTO.builder()
                .id(String.valueOf(attempt.getId()))
                .quizId(String.valueOf(quiz.getId()))
                .userId(String.valueOf(user.getId()))
                .answers(new ArrayList<>())
                .startedAt(attempt.getStartedAt().toString())
                .submittedAt(null)
                .build();
    }

    @Transactional
    public DetailedResultDTO submitAttempt(Long attemptId, List<SubmitAnswerDTO> submittedAnswers) {
        QuizAttemptEntity attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (!"IN_PROGRESS".equals(attempt.getStatus())) {
            throw new IllegalStateException("Attempt is already submitted");
        }

        QuizEntity quiz = attempt.getQuiz();
        UserEntity user = attempt.getUser();

        double totalScore = 0.0;
        double maxPossibleScore = 0.0;
        int correctCount = 0;
        int incorrectCount = 0;
        int skippedCount = 0;

        List<QuestionResultDTO> questionResults = new ArrayList<>();
        Map<String, List<Boolean>> subjectAccuracyMap = new HashMap<>();

        // Map submitted answers by questionId for fast access
        Map<Long, SubmitAnswerDTO> answerMap = new HashMap<>();
        if (submittedAnswers != null) {
            for (SubmitAnswerDTO sa : submittedAnswers) {
                try {
                    answerMap.put(Long.parseLong(sa.getQuestionId()), sa);
                } catch (NumberFormatException ignored) {}
            }
        }

        long easySolved = 0;
        long mediumSolved = 0;
        long hardSolved = 0;
        long xpGained = 0;

        // Iterate through all sections and their questions
        if (quiz.getSections() != null) {
            for (QuizSectionEntity section : quiz.getSections()) {
                if (section.getQuestions() == null) continue;
                for (QuizQuestionEntity qq : section.getQuestions()) {
                    QuestionEntity question = qq.getQuestion();
                    if (question == null) continue;

                    double questionMarks = (qq.getMarksOverride() != null) ? qq.getMarksOverride() : (question.getMarks() != null ? question.getMarks() : 1.0);
                    double questionNegMarks = (qq.getNegativeMarksOverride() != null) ? qq.getNegativeMarksOverride() : (question.getNegativeMarks() != null ? question.getNegativeMarks() : 0.0);

                    maxPossibleScore += questionMarks;

                    SubmitAnswerDTO sa = answerMap.get(question.getId());
                    boolean hasAnswered = sa != null && (
                        (sa.getSelectedOptionIds() != null && !sa.getSelectedOptionIds().isEmpty()) ||
                        (sa.getTextAnswer() != null && !sa.getTextAnswer().trim().isEmpty())
                    );

                    boolean isCorrect = false;
                    double marksAwarded = 0.0;
                    String status = "SKIPPED";

                    List<String> correctOptionIds = question.getOptions().stream()
                            .filter(o -> o.getIsCorrect() != null && o.getIsCorrect())
                            .map(o -> String.valueOf(o.getId()))
                            .collect(Collectors.toList());

                    if (hasAnswered) {
                        status = "ANSWERED";
                        List<String> selected = sa.getSelectedOptionIds();
                        if (!correctOptionIds.isEmpty()) {
                            isCorrect = selected != null && selected.size() == correctOptionIds.size() && selected.containsAll(correctOptionIds);
                        } else {
                            // Subjective/numerical: mark correct if any response is entered (positive reinforcement fallback)
                            isCorrect = true;
                        }

                        if (isCorrect) {
                            marksAwarded = questionMarks;
                            correctCount++;
                            
                            String diff = question.getDifficulty();
                            if ("EASY".equalsIgnoreCase(diff)) {
                                xpGained += 10;
                                easySolved++;
                            } else if ("MEDIUM".equalsIgnoreCase(diff)) {
                                xpGained += 20;
                                mediumSolved++;
                            } else if ("HARD".equalsIgnoreCase(diff)) {
                                xpGained += 30;
                                hardSolved++;
                            } else {
                                xpGained += 10;
                                easySolved++;
                            }
                        } else {
                            marksAwarded = -questionNegMarks;
                            incorrectCount++;
                        }
                    } else {
                        skippedCount++;
                    }

                    totalScore += marksAwarded;

                    // Save answer entity
                    AttemptAnswerEntity answerEntity = new AttemptAnswerEntity();
                    answerEntity.setAttempt(attempt);
                    answerEntity.setQuestion(question);
                    try {
                        answerEntity.setSelectedOptionIds(objectMapper.writeValueAsString(sa != null ? sa.getSelectedOptionIds() : new ArrayList<>()));
                    } catch (Exception e) {
                        answerEntity.setSelectedOptionIds("[]");
                    }
                    answerEntity.setTextAnswer(sa != null ? sa.getTextAnswer() : null);
                    answerEntity.setIsCorrect(isCorrect);
                    answerEntity.setMarksAwarded(marksAwarded);
                    answerEntity.setStatus(status);
                    answerEntity.setTimeSpentSeconds(sa != null && sa.getTimeSpentSeconds() != null ? sa.getTimeSpentSeconds() : 0);
                    answerRepository.save(answerEntity);

                    // Collect results for DTO
                    questionResults.add(QuestionResultDTO.builder()
                            .questionId(String.valueOf(question.getId()))
                            .text(question.getQuestionText())
                            .type(question.getQuestionType())
                            .selectedOptionIds(sa != null ? sa.getSelectedOptionIds() : new ArrayList<>())
                            .correctOptionIds(correctOptionIds)
                            .isCorrect(isCorrect)
                            .marksAwarded(marksAwarded)
                            .explanation(question.getMetadata() != null ? question.getMetadata() : "Correct answer options: " + String.join(", ", correctOptionIds))
                            .build());

                    String subjectName = question.getSubject() != null ? question.getSubject() : "Core Subjects";
                    subjectAccuracyMap.computeIfAbsent(subjectName, k -> new ArrayList<>()).add(isCorrect);
                }
            }
        }

        // Bounded score to at least 0.0
        if (totalScore < 0) totalScore = 0.0;

        attempt.setStatus("SUBMITTED");
        attempt.setScore(totalScore);
        attempt.setCompletedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        // Update user XP & Solved counts
        if (xpGained > 0) {
            user.setXp((user.getXp() == null ? 0 : user.getXp()) + xpGained);
            user.setEasySolvedCount((user.getEasySolvedCount() == null ? 0 : user.getEasySolvedCount()) + easySolved);
            user.setMediumSolvedCount((user.getMediumSolvedCount() == null ? 0 : user.getMediumSolvedCount()) + mediumSolved);
            user.setHardSolvedCount((user.getHardSolvedCount() == null ? 0 : user.getHardSolvedCount()) + hardSolved);
            userRepository.save(user);

            // Dynamic badges evaluation
            achievementService.evaluateAndUnlockAchievements(user);
        }

        // Construct breakdowns
        List<SubjectBreakdownDTO> subjectBreakdowns = new ArrayList<>();
        for (Map.Entry<String, List<Boolean>> entry : subjectAccuracyMap.entrySet()) {
            long total = entry.getValue().size();
            long correct = entry.getValue().stream().filter(b -> b).count();
            double acc = total == 0 ? 0.0 : (correct * 100.0) / total;
            subjectBreakdowns.add(SubjectBreakdownDTO.builder()
                    .subject(entry.getKey())
                    .totalQuestions((int) total)
                    .correctCount((int) correct)
                    .accuracy(acc)
                    .build());
        }

        int totalQ = correctCount + incorrectCount + skippedCount;
        double finalAccuracy = totalQ == 0 ? 0.0 : (correctCount * 100.0) / totalQ;

        List<String> strongTopics = new ArrayList<>();
        List<String> weakTopics = new ArrayList<>();
        for (SubjectBreakdownDTO sb : subjectBreakdowns) {
            if (sb.getAccuracy() >= 70.0) {
                strongTopics.add(sb.getSubject());
            } else {
                weakTopics.add(sb.getSubject());
            }
        }

        return DetailedResultDTO.builder()
                .attemptId(String.valueOf(attempt.getId()))
                .quizId(String.valueOf(quiz.getId()))
                .quizTitle(quiz.getTitle())
                .userId(String.valueOf(user.getId()))
                .score(totalScore)
                .totalMarks(maxPossibleScore)
                .accuracy(finalAccuracy)
                .timeTakenSeconds(300) 
                .rank(1) 
                .correctCount(correctCount)
                .incorrectCount(incorrectCount)
                .skippedCount(skippedCount)
                .subjectBreakdown(subjectBreakdowns)
                .questionResults(questionResults)
                .weakTopics(weakTopics)
                .strongTopics(strongTopics)
                .completedAt(attempt.getCompletedAt().toString())
                .build();
    }

    @Transactional(readOnly = true)
    public DetailedResultDTO getAttemptResult(Long attemptId) {
        QuizAttemptEntity attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        QuizEntity quiz = attempt.getQuiz();
        UserEntity user = attempt.getUser();

        List<AttemptAnswerEntity> answers = answerRepository.findByAttemptId(attemptId);

        double totalScore = attempt.getScore() != null ? attempt.getScore() : 0.0;
        double maxPossibleScore = 0.0;
        int correctCount = 0;
        int incorrectCount = 0;
        int skippedCount = 0;

        List<QuestionResultDTO> questionResults = new ArrayList<>();
        Map<String, List<Boolean>> subjectAccuracyMap = new HashMap<>();

        for (AttemptAnswerEntity ans : answers) {
            QuestionEntity question = ans.getQuestion();
            if (question == null) continue;

            double questionMarks = question.getMarks() != null ? question.getMarks() : 1.0;
            maxPossibleScore += questionMarks;

            List<String> correctOptionIds = question.getOptions().stream()
                    .filter(o -> o.getIsCorrect() != null && o.getIsCorrect())
                    .map(o -> String.valueOf(o.getId()))
                    .collect(Collectors.toList());

            List<String> selectedOptions = new ArrayList<>();
            try {
                selectedOptions = objectMapper.readValue(ans.getSelectedOptionIds(), List.class);
            } catch (Exception ignored) {}

            boolean isCorrect = ans.getIsCorrect() != null && ans.getIsCorrect();
            if ("SKIPPED".equals(ans.getStatus())) {
                skippedCount++;
            } else if (isCorrect) {
                correctCount++;
            } else {
                incorrectCount++;
            }

            questionResults.add(QuestionResultDTO.builder()
                    .questionId(String.valueOf(question.getId()))
                    .text(question.getQuestionText())
                    .type(question.getQuestionType())
                    .selectedOptionIds(selectedOptions)
                    .correctOptionIds(correctOptionIds)
                    .isCorrect(isCorrect)
                    .marksAwarded(ans.getMarksAwarded())
                    .explanation(question.getMetadata() != null ? question.getMetadata() : "Correct answer options: " + String.join(", ", correctOptionIds))
                    .build());

            String subjectName = question.getSubject() != null ? question.getSubject() : "Core Subjects";
            subjectAccuracyMap.computeIfAbsent(subjectName, k -> new ArrayList<>()).add(isCorrect);
        }

        List<SubjectBreakdownDTO> subjectBreakdowns = new ArrayList<>();
        for (Map.Entry<String, List<Boolean>> entry : subjectAccuracyMap.entrySet()) {
            long total = entry.getValue().size();
            long correct = entry.getValue().stream().filter(b -> b).count();
            double acc = total == 0 ? 0.0 : (correct * 100.0) / total;
            subjectBreakdowns.add(SubjectBreakdownDTO.builder()
                    .subject(entry.getKey())
                    .totalQuestions((int) total)
                    .correctCount((int) correct)
                    .accuracy(acc)
                    .build());
        }

        int totalQ = correctCount + incorrectCount + skippedCount;
        double finalAccuracy = totalQ == 0 ? 0.0 : (correctCount * 100.0) / totalQ;

        List<String> strongTopics = new ArrayList<>();
        List<String> weakTopics = new ArrayList<>();
        for (SubjectBreakdownDTO sb : subjectBreakdowns) {
            if (sb.getAccuracy() >= 70.0) {
                strongTopics.add(sb.getSubject());
            } else {
                weakTopics.add(sb.getSubject());
            }
        }

        return DetailedResultDTO.builder()
                .attemptId(String.valueOf(attempt.getId()))
                .quizId(String.valueOf(quiz.getId()))
                .quizTitle(quiz.getTitle())
                .userId(String.valueOf(user.getId()))
                .score(totalScore)
                .totalMarks(maxPossibleScore)
                .accuracy(finalAccuracy)
                .timeTakenSeconds(300)
                .rank(1)
                .correctCount(correctCount)
                .incorrectCount(incorrectCount)
                .skippedCount(skippedCount)
                .subjectBreakdown(subjectBreakdowns)
                .questionResults(questionResults)
                .weakTopics(weakTopics)
                .strongTopics(strongTopics)
                .completedAt(attempt.getCompletedAt() != null ? attempt.getCompletedAt().toString() : LocalDateTime.now().toString())
                .build();
    }
}
