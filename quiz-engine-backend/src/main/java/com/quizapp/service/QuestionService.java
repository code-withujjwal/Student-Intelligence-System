package com.quizapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizapp.dto.PaginatedResponseDTO;
import com.quizapp.dto.QuestionRequestDTO;
import com.quizapp.dto.QuestionResponseDTO;
import com.quizapp.dto.QuestionOptionDTO;
import com.quizapp.dto.QuestionOptionResponseDTO;
import com.quizapp.entity.QuestionEntity;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    public PaginatedResponseDTO<QuestionResponseDTO> getAllQuestions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<QuestionEntity> questionsPage = questionRepository.findAll(pageable);
        
        List<QuestionResponseDTO> dtoList = questionsPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new PaginatedResponseDTO<>(
                dtoList,
                questionsPage.getTotalPages(),
                questionsPage.getTotalElements(),
                questionsPage.getNumber()
        );
    }

    public QuestionResponseDTO createQuestion(QuestionRequestDTO dto) {
        QuestionEntity entity = new QuestionEntity();
        entity.setPublicId(UUID.randomUUID().toString());
        updateEntityFromDTO(entity, dto);
        
        QuestionEntity saved = questionRepository.save(entity);
        return mapToDTO(saved);
    }

    public QuestionResponseDTO updateQuestion(Long id, QuestionRequestDTO dto) {
        QuestionEntity entity = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        updateEntityFromDTO(entity, dto);
        QuestionEntity updated = questionRepository.save(entity);
        return mapToDTO(updated);
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    public QuestionResponseDTO getQuestionById(Long id) {
        QuestionEntity entity = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        return mapToDTO(entity);
    }

    private void updateEntityFromDTO(QuestionEntity entity, QuestionRequestDTO dto) {
        entity.setTitle(dto.getTitle());
        entity.setQuestionText(dto.getQuestionText());
        entity.setQuestionType(dto.getQuestionType());
        entity.setDepartment(dto.getDepartment());
        entity.setSubject(dto.getSubject());
        entity.setDifficulty(dto.getDifficulty());
        entity.setStatus(dto.getStatus() == null ? "DRAFT" : dto.getStatus());
        entity.setMarks(dto.getMarks());
        entity.setNegativeMarks(dto.getNegativeMarks());
        
        if (dto.getOptions() != null) {
            if (entity.getOptions() == null) {
                entity.setOptions(new java.util.ArrayList<>());
            } else {
                entity.getOptions().clear();
            }
            for (QuestionOptionDTO optDto : dto.getOptions()) {
                com.quizapp.entity.QuestionOptionEntity optEntity = new com.quizapp.entity.QuestionOptionEntity();
                optEntity.setQuestion(entity);
                optEntity.setOptionText(optDto.getOptionText());
                optEntity.setIsCorrect(optDto.getIsCorrect() != null && optDto.getIsCorrect());
                entity.getOptions().add(optEntity);
            }
        }

        try {
            if (dto.getMetadata() != null) {
                entity.setMetadata(objectMapper.writeValueAsString(dto.getMetadata()));
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse metadata JSON", e);
        }
    }

    private QuestionResponseDTO mapToDTO(QuestionEntity entity) {
        QuestionResponseDTO dto = new QuestionResponseDTO();
        dto.setId(entity.getId());
        dto.setPublicId(entity.getPublicId());
        dto.setTitle(entity.getTitle());
        dto.setQuestionText(entity.getQuestionText());
        dto.setQuestionType(entity.getQuestionType());
        dto.setDepartment(entity.getDepartment());
        dto.setSubject(entity.getSubject());
        dto.setDifficulty(entity.getDifficulty());
        dto.setStatus(entity.getStatus());
        dto.setMarks(entity.getMarks());
        dto.setNegativeMarks(entity.getNegativeMarks());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getOptions() != null) {
            dto.setOptions(entity.getOptions().stream()
                .map(o -> {
                    QuestionOptionResponseDTO opt = new QuestionOptionResponseDTO();
                    opt.setId(o.getId());
                    opt.setOptionText(o.getOptionText());
                    opt.setIsCorrect(o.getIsCorrect());
                    return opt;
                })
                .collect(Collectors.toList()));
        }

        try {
            if (entity.getMetadata() != null) {
                dto.setMetadata(objectMapper.readValue(entity.getMetadata(), Object.class));
            }
        } catch (JsonProcessingException e) {
            dto.setMetadata(null);
        }

        return dto;
    }
}
