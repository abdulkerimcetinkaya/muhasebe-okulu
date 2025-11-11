package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for StudyQuestionOption
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyQuestionOptionDTO {
    private Long id;
    private String optionText;
    private Boolean isCorrect;
    private Integer displayOrder;
    private String explanation;
}
