package com.example.muhasebeokulu5.dto;

import com.example.muhasebeokulu5.entities.CardSection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for CardSection details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardSectionDTO {
    private Long id;
    private Long studyCardId; // Required when creating/updating
    private String title;
    private Integer displayOrder;
    private String contentType; // TEXT, PROBLEM, QUIZ
    private String content; // Text content if contentType = TEXT
    private Long relatedProblemId; // ID if contentType = PROBLEM
    private Long relatedQuizId; // ID if contentType = QUIZ
    private Boolean active; // Maps to isActive

    // Additional fields for linked entities (populated by service)
    private ProblemDTO relatedProblem; // Problem details if contentType = PROBLEM
    private QuizDTO relatedQuiz; // Quiz details if contentType = QUIZ
}
