package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.entities.UserAnswer;
import com.example.muhasebeokulu5.service.UserAnswerService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-answers")
public class UserAnswerController {

    private final UserAnswerService userAnswerService;
    public UserAnswerController(UserAnswerService userAnswerService) { this.userAnswerService = userAnswerService; }

    @GetMapping("/user/{userId}")
    public List<UserAnswer> getByUser(@PathVariable UUID userId) {
        return userAnswerService.getAnswersByUserId(userId);
    }

    @GetMapping("/problem/{problemId}")
    public List<UserAnswer> getByProblem(@PathVariable Long problemId) {
        return userAnswerService.getAnswersByProblemId(problemId);
    }

    @PostMapping
    public UserAnswer save(@RequestBody UserAnswer answer) {
        return userAnswerService.save(answer);
    }
}
