package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for StudyQuiz
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyQuizDTO {
    private Long id;
    private String title;
    private String description;
    private Integer timeLimitMinutes;
    private Integer passPercentage;
    private List<StudyQuestionDTO> questions;
}
