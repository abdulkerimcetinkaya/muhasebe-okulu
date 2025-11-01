package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.UserAnswerDTO;
import com.example.muhasebeokulu5.service.AnswerService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/answers")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @PostMapping("/check/{problemId}")
    public Map<String, Object> checkAnswer(
            @PathVariable("problemId") String problemId,
            @RequestBody UserAnswerDTO userAnswerDTO) {
        return answerService.checkAnswer(problemId, userAnswerDTO);
    }
}
