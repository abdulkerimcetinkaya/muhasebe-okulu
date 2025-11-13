package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.QuizDTO;
import com.example.muhasebeokulu5.dto.QuizResultDTO;
import com.example.muhasebeokulu5.dto.QuizSubmissionDTO;
import com.example.muhasebeokulu5.service.QuizService;
import com.example.muhasebeokulu5.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class StudentQuizController {

    private final QuizService quizService;
    private final UserService userService;

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
    public ResponseEntity<List<QuizDTO>> getCompletedQuizzes(
            @PathVariable UUID userId,
            Authentication authentication) {

        // Giriş yapan kullanıcının ID'sini al
        UUID authenticatedUserId = userService.getUserIdByUsername(authentication.getName());

        // Path variable ile authentication'ı karşılaştır - Privilege Escalation önleme
        if (!userId.equals(authenticatedUserId)) {
            return ResponseEntity.status(403).build();  // Forbidden
        }

        return ResponseEntity.ok(quizService.getCompletedQuizzes(userId));
    }
}
