package com.quizapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.dto.*;
import com.quizapp.entity.QuestionEntity;
import com.quizapp.entity.QuizEntity;
import com.quizapp.entity.QuizSectionEntity;
import com.quizapp.entity.QuizQuestionEntity;
import com.quizapp.entity.QuestionOptionEntity;
import com.quizapp.entity.UserEntity;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository; // Assuming teacher is needed
    private final ObjectMapper objectMapper;

    @Transactional
    public QuizResponseDTO createQuiz(QuizRequestDTO dto) {
        QuizEntity quiz = new QuizEntity();
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.setSubject(dto.getSubject());
        quiz.setStatus("DRAFT");
        quiz.setDurationMinutes(dto.getSettings() != null ? dto.getSettings().getDurationMinutes() : 60);
        quiz.setMaxAttempts(dto.getSettings() != null ? dto.getSettings().getMaxAttempts() : 1);

        // Dummy teacher for phase 1
        UserEntity dummyTeacher = userRepository.findById(1L).orElseGet(() -> {
            UserEntity u = new UserEntity();
            u.setUsername("admin");
            u.setEmail("admin@quiz.com");
            u.setPassword("hash");
            u.setRole(com.quizapp.entity.Role.ADMIN);
            return userRepository.save(u);
        });
        quiz.setTeacher(dummyTeacher);

        try {
            if (dto.getSettings() != null) {
                quiz.setSettings(objectMapper.writeValueAsString(dto.getSettings()));
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize quiz settings", e);
        }

        // Add sections
        if (dto.getSections() != null) {
            int sectionOrder = 0;
            for (QuizSectionDTO secDto : dto.getSections()) {
                QuizSectionEntity section = new QuizSectionEntity();
                section.setTitle(secDto.getTitle());
                section.setSectionOrder(sectionOrder++);
                section.setQuiz(quiz);
                
                if (secDto.getQuestions() != null) {
                    int questionOrder = 0;
                    for (QuizQuestionDTO qDto : secDto.getQuestions()) {
                        QuestionEntity questionRef = questionRepository.findById(qDto.getQuestionId())
                            .orElseThrow(() -> new ResourceNotFoundException("Question not found ID: " + qDto.getQuestionId()));
                        
                        QuizQuestionEntity quizQuestion = new QuizQuestionEntity();
                        quizQuestion.setSection(section);
                        quizQuestion.setQuestion(questionRef);
                        quizQuestion.setQuestionOrder(questionOrder++);
                        quizQuestion.setMarksOverride(qDto.getMarks());
                        quizQuestion.setNegativeMarksOverride(qDto.getNegativeMarks());
                        section.getQuestions().add(quizQuestion);
                    }
                }
                
                quiz.getSections().add(section);
            }
        }

        QuizEntity saved = quizRepository.save(quiz);
        return mapToDTO(saved);
    }

    public List<QuizResponseDTO> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public QuizResponseDTO getQuizById(Long id) {
        QuizEntity quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        return mapToDTO(quiz);
    }

    private QuizResponseDTO mapToDTO(QuizEntity entity) {
        QuizResponseDTO dto = new QuizResponseDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setSubject(entity.getSubject());
        dto.setStatus(entity.getStatus());
        dto.setDurationMinutes(entity.getDurationMinutes());
        dto.setMaxAttempts(entity.getMaxAttempts());
        dto.setCreatedAt(entity.getCreatedAt());

        try {
            if (entity.getSettings() != null) {
                dto.setSettings(objectMapper.readValue(entity.getSettings(), Object.class));
            }
        } catch (JsonProcessingException e) {
            dto.setSettings(null);
        }
        
        // Map sections and questions
        List<QuizSectionDTO> sections = new ArrayList<>();
        if (entity.getSections() != null) {
            for (QuizSectionEntity secEntity : entity.getSections()) {
                QuizSectionDTO secDto = new QuizSectionDTO();
                secDto.setTitle(secEntity.getTitle());
                
                List<QuizQuestionDTO> questions = new ArrayList<>();
                if (secEntity.getQuestions() != null) {
                    for (QuizQuestionEntity qEntity : secEntity.getQuestions()) {
                        QuizQuestionDTO qDto = new QuizQuestionDTO();
                        qDto.setQuestionId(qEntity.getQuestion().getId());
                        qDto.setMarks(qEntity.getMarksOverride() != null ? qEntity.getMarksOverride() : qEntity.getQuestion().getMarks());
                        qDto.setNegativeMarks(qEntity.getNegativeMarksOverride() != null ? qEntity.getNegativeMarksOverride() : qEntity.getQuestion().getNegativeMarks());
                        
                        // Map question details
                        QuestionResponseDTO qDetails = new QuestionResponseDTO();
                        QuestionEntity qEnt = qEntity.getQuestion();
                        qDetails.setId(qEnt.getId());
                        qDetails.setPublicId(qEnt.getPublicId());
                        qDetails.setTitle(qEnt.getTitle());
                        qDetails.setQuestionText(qEnt.getQuestionText());
                        qDetails.setQuestionType(qEnt.getQuestionType());
                        qDetails.setDepartment(qEnt.getDepartment());
                        qDetails.setSubject(qEnt.getSubject());
                        qDetails.setDifficulty(qEnt.getDifficulty());
                        qDetails.setStatus(qEnt.getStatus());
                        qDetails.setMarks(qEnt.getMarks());
                        qDetails.setNegativeMarks(qEnt.getNegativeMarks());
                        qDetails.setMetadata(qEnt.getMetadata());
                        
                        List<QuestionOptionResponseDTO> options = new ArrayList<>();
                        if (qEnt.getOptions() != null) {
                            for (QuestionOptionEntity optEnt : qEnt.getOptions()) {
                                QuestionOptionResponseDTO optDto = new QuestionOptionResponseDTO();
                                optDto.setId(optEnt.getId());
                                optDto.setOptionText(optEnt.getOptionText());
                                optDto.setIsCorrect(optEnt.getIsCorrect());
                                options.add(optDto);
                            }
                        }
                        qDetails.setOptions(options);
                        qDto.setQuestionDetails(qDetails);
                        
                        questions.add(qDto);
                    }
                }
                secDto.setQuestions(questions);
                sections.add(secDto);
            }
        }
        dto.setSections(sections);

        return dto;
    }
}
