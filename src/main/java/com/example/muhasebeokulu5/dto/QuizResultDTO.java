package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDTO {

    private Long quizId;
    private String quizTitle;
    private UUID userId;
    private String username;

    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer totalPoints;
    private Integer earnedPoints;
    private Double percentage;
    private Boolean passed;

    private LocalDateTime completedAt;
    private List<QuestionResultDTO> questionResults;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResultDTO {
        private Long questionId;
        private String questionText;
        private Long selectedOptionId;
        private String selectedOptionText;
        private Long correctOptionId;
        private String correctOptionText;
        private Boolean isCorrect;
        private Integer points;
        private Integer earnedPoints;
    }
}
