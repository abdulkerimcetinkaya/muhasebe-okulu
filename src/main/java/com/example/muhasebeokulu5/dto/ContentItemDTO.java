package com.example.muhasebeokulu5.dto;

import com.example.muhasebeokulu5.entities.ContentItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for ContentItem - Individual content pieces within a section
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentItemDTO {
    private Long id;
    private Long cardSectionId;
    private String contentType; // TEXT, PROBLEM, QUIZ, STUDY_PROBLEM, STUDY_QUIZ, PARAGRAPH, HEADING, LIST, TABLE, DIVIDER, CODE, QUOTE, CALLOUT
    private Integer displayOrder;
    private Boolean active;

    // For TEXT type
    private String textContent; // HTML content

    // For BLOCK-based content (Notion-like blocks)
    private String blockData; // JSON data for structured blocks

    // For STUDY_PROBLEM type
    private StudyProblemDTO studyProblem;

    // For STUDY_QUIZ type
    private StudyQuizDTO studyQuiz;

    // For external references
    private Long relatedProblemId; // PROBLEM type
    private Long relatedQuizId;    // QUIZ type

    // Optional: Include full related entities
    private ProblemDTO relatedProblem;
    private QuizDTO relatedQuiz;
}
