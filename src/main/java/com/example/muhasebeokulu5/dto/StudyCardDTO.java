package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for StudyCard listing on study.html
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyCardDTO {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private String color;
    private Integer displayOrder;
    private Integer sectionCount; // Total number of sections in this card
}
