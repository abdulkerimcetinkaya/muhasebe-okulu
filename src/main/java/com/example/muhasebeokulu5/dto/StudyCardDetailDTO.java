package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for StudyCard detail page with sections
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyCardDetailDTO {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private String color;
    private List<CardSectionDTO> sections;
}
