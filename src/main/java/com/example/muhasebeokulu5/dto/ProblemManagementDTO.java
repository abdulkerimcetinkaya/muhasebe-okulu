package com.example.muhasebeokulu5.dto;

import com.example.muhasebeokulu5.entities.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemManagementDTO {
    private Long id;
    private String title;
    private String content;
    private String hint;
    private String tags;
    private Difficulty difficulty;
    private LocalDateTime createdAt;
    private Long solveCount;
    private Double successRate;
    private List<CorrectEntryDTO> correctEntries;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CorrectEntryDTO {
        private Long id;
        private String accountCode;
        private String accountName;
        private Double debitAmount;
        private Double creditAmount;
    }
}
