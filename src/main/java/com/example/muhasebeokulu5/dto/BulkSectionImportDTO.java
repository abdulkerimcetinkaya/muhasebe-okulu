package com.example.muhasebeokulu5.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for bulk section import
 * Allows importing multiple sections with content items into an existing study card
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkSectionImportDTO {

    @NotNull(message = "Study card ID cannot be null")
    private Long studyCardId;

    @NotEmpty(message = "Sections list cannot be empty")
    @Valid
    private List<CardSectionDTO> sections = new ArrayList<>();

    /**
     * Import result summary
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportResult {
        private Long studyCardId;
        private int totalSections;
        private int successCount;
        private int failureCount;
        private List<ImportError> errors = new ArrayList<>();
    }

    /**
     * Individual import error details
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private int sectionIndex;
        private String sectionTitle;
        private String errorMessage;
    }
}
