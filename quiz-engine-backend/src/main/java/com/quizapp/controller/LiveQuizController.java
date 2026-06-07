package com.quizapp.controller;

import com.quizapp.dto.QuizAnswerDTO;
import com.quizapp.dto.QuizJoinRequestDTO;
import com.quizapp.service.LiveQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class LiveQuizController {

    private final LiveQuizService liveQuizService;

    @MessageMapping("/quiz/join")
    public void joinSession(@Payload QuizJoinRequestDTO joinRequest) {
        liveQuizService.joinSession(joinRequest.getSessionId(), joinRequest.getUsername());
    }

    @MessageMapping("/quiz/answer")
    public void submitAnswer(@Payload QuizAnswerDTO answer) {
        liveQuizService.submitAnswer(answer);
    }
}
