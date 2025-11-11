package com.example.muhasebeokulu5.dto;

import com.example.muhasebeokulu5.entities.StudyProblem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for StudyProblem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyProblemDTO {
    private Long id;
    private String title;
    private String content; // HTML content
    private String hint;
    private StudyProblem.Difficulty difficulty;
    private List<StudyProblemEntryDTO> correctEntries;
}
