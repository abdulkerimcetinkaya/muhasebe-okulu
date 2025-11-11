package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for StudyProblemEntry
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyProblemEntryDTO {
    private Long id;
    private String accountCode;
    private String accountName;
    private Double debitAmount;
    private Double creditAmount;
    private String explanation;
}
