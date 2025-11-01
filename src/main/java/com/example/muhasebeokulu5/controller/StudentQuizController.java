package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.QuizDTO;
import com.example.muhasebeokulu5.dto.QuizResultDTO;
import com.example.muhasebeokulu5.dto.QuizSubmissionDTO;
import com.example.muhasebeokulu5.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class StudentQuizController {

    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<List<QuizDTO>> getActiveQuizzes() {
        return ResponseEntity.ok(quizService.getActiveQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuizForStudent(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizForStudent(id));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultDTO> submitQuiz(@Valid @RequestBody QuizSubmissionDTO submissionDTO) {
        QuizResultDTO result = quizService.submitQuiz(submissionDTO);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/{userId}/completed")
    public ResponseEntity<List<QuizDTO>> getCompletedQuizzes(@PathVariable UUID userId) {
        return ResponseEntity.ok(quizService.getCompletedQuizzes(userId));
    }
}
