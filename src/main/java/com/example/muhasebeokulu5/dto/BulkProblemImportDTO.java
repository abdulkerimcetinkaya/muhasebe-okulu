package com.example.muhasebeokulu5.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for bulk problem import
 * Allows importing multiple problems at once via JSON or CSV
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkProblemImportDTO {

    @NotEmpty(message = "Problem listesi boş olamaz")
    @Valid
    private List<CreateProblemDTO> problems;

    /**
     * Import result summary
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportResult {
        private int totalProblems;
        private int successCount;
        private int failureCount;
        private List<ImportError> errors;
    }

    /**
     * Individual import error details
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private int problemIndex;  // 0-based index in the input list
        private String problemTitle;
        private String errorMessage;
    }
}
