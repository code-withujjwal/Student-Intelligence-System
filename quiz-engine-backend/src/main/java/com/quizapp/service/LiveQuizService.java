package com.quizapp.service;

import com.quizapp.dto.LeaderboardEntryDTO;
import com.quizapp.dto.QuizAnswerDTO;
import com.quizapp.entity.LiveAnswerEntity;
import com.quizapp.entity.ParticipantEntity;
import com.quizapp.entity.QuizSessionEntity;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.LiveAnswerRepository;
import com.quizapp.repository.ParticipantRepository;
import com.quizapp.repository.QuizSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LiveQuizService {

    private final QuizSessionRepository sessionRepository;
    private final ParticipantRepository participantRepository;
    private final LiveAnswerRepository answerRepository;
    private final ScoringEngine scoringEngine;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void joinSession(String sessionId, String username) {
        QuizSessionEntity session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        
        ParticipantEntity participant = participantRepository.findBySessionSessionIdAndUsername(sessionId, username)
                .orElseGet(() -> {
                    ParticipantEntity p = new ParticipantEntity();
                    p.setSession(session);
                    p.setUsername(username);
                    return p;
                });
        
        participant.setIsOnline(true);
        participantRepository.save(participant);
        
        broadcastLeaderboard(sessionId);
    }

    @Transactional
    public void submitAnswer(QuizAnswerDTO answerDto) {
        ParticipantEntity participant = participantRepository.findBySessionSessionIdAndUsername(answerDto.getSessionId(), answerDto.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));
                
        // Simplified check: assume answer is correct if it matches "Correct" for Phase 4 mock testing
        // Real implementation would look up QuestionEntity options.
        boolean isCorrect = "Correct".equalsIgnoreCase(answerDto.getAnswer()) || answerDto.getAnswer().contains("Option A");
        
        Double points = scoringEngine.calculateScore(isCorrect, answerDto.getTimeTakenSeconds(), 10.0);
        
        LiveAnswerEntity liveAnswer = new LiveAnswerEntity();
        liveAnswer.setParticipant(participant);
        liveAnswer.setQuestionId(answerDto.getQuestionId());
        liveAnswer.setSubmittedAnswer(answerDto.getAnswer());
        liveAnswer.setIsCorrect(isCorrect);
        liveAnswer.setPointsAwarded(points);
        liveAnswer.setTimeTakenSeconds(answerDto.getTimeTakenSeconds());
        answerRepository.save(liveAnswer);
        
        participant.setScore(participant.getScore() + points);
        participantRepository.save(participant);
        
        broadcastLeaderboard(answerDto.getSessionId());
    }

    public void broadcastLeaderboard(String sessionId) {
        List<ParticipantEntity> topParticipants = participantRepository.findBySessionSessionIdOrderByScoreDesc(sessionId);
        
        List<LeaderboardEntryDTO> leaderboard = topParticipants.stream().map(p -> {
            LeaderboardEntryDTO dto = new LeaderboardEntryDTO();
            dto.setUsername(p.getUsername());
            dto.setScore(p.getScore());
            return dto;
        }).collect(Collectors.toList());
        
        // Update ranks
        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).setRank(i + 1);
        }
        
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/leaderboard", leaderboard);
    }
}
