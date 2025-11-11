package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.BulkQuestionImportDTO;
import com.example.muhasebeokulu5.dto.QuestionDTO;
import com.example.muhasebeokulu5.dto.QuizDTO;
import com.example.muhasebeokulu5.dto.TopicDTO;
import com.example.muhasebeokulu5.service.QuizService;
import com.example.muhasebeokulu5.service.TopicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/quizzes")
@RequiredArgsConstructor
public class AdminQuizController {

    private final QuizService quizService;
    private final TopicService topicService;

    // ==================== Topic Management ====================

    @GetMapping("/topics")
    public ResponseEntity<List<TopicDTO>> getAllTopics() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }

    @GetMapping("/topics/{id}")
    public ResponseEntity<TopicDTO> getTopicById(@PathVariable Long id) {
        return ResponseEntity.ok(topicService.getTopicById(id));
    }

    @PostMapping("/topics")
    public ResponseEntity<TopicDTO> createTopic(@Valid @RequestBody TopicDTO topicDTO) {
        TopicDTO created = topicService.createTopic(topicDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<TopicDTO> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody TopicDTO topicDTO) {
        return ResponseEntity.ok(topicService.updateTopic(id, topicDTO));
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Quiz Management ====================

    @GetMapping
    public ResponseEntity<Page<QuizDTO>> getAllQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        return ResponseEntity.ok(quizService.getAllQuizzes(pageable));
    }

    @GetMapping("/active")
    public ResponseEntity<List<QuizDTO>> getActiveQuizzes() {
        return ResponseEntity.ok(quizService.getActiveQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @PostMapping
    public ResponseEntity<QuizDTO> createQuiz(@Valid @RequestBody QuizDTO quizDTO) {
        QuizDTO created = quizService.createQuiz(quizDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizDTO> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizDTO quizDTO) {
        return ResponseEntity.ok(quizService.updateQuiz(id, quizDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Question Management ====================

    @PostMapping("/questions")
    public ResponseEntity<QuestionDTO> addQuestion(@Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO created = quizService.addQuestion(questionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionDTO questionDTO) {
        return ResponseEntity.ok(quizService.updateQuestion(id, questionDTO));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        quizService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/questions/bulk")
    public ResponseEntity<BulkQuestionImportDTO.ImportResult> bulkImportQuestions(
            @Valid @RequestBody BulkQuestionImportDTO bulkImportDTO) {
        BulkQuestionImportDTO.ImportResult result = quizService.bulkImportQuestions(bulkImportDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
