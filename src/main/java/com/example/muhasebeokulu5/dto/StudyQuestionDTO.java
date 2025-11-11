package com.example.muhasebeokulu5.dto;

import com.example.muhasebeokulu5.entities.StudyQuestion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for StudyQuestion
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyQuestionDTO {
    private Long id;
    private String questionText;
    private StudyQuestion.QuestionType questionType;
    private Integer displayOrder;
    private Integer points;
    private List<StudyQuestionOptionDTO> options;
}
