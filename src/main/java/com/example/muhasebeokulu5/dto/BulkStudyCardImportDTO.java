package com.example.muhasebeokulu5.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for bulk study card import
 * Allows importing multiple study cards with sections via JSON
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkStudyCardImportDTO {

    @NotEmpty(message = "Kart listesi boş olamaz")
    @Valid
    private List<CardImportItem> cards;

    /**
     * Individual card for import
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardImportItem {

        @NotEmpty(message = "Başlık boş olamaz")
        private String title;

        private String description;

        private String imageUrl;

        private Boolean isActive;

        @Valid
        private List<SectionImportItem> sections;
    }

    /**
     * Individual section for import
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionImportItem {

        @NotEmpty(message = "Bölüm başlığı boş olamaz")
        private String title;

        @NotEmpty(message = "İçerik tipi boş olamaz")
        private String contentType; // TEXT, PROBLEM, QUIZ

        private String content; // For TEXT type

        private Long problemId; // For PROBLEM type

        private Long quizId; // For QUIZ type

        private Boolean isActive;
    }

    /**
     * Import result summary
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportResult {
        private int totalCards;
        private int successCount;
        private int failureCount;
        private int totalSections;
        private int successSectionCount;
        private List<ImportError> errors;
    }

    /**
     * Individual import error details
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private int cardIndex;
        private String cardTitle;
        private String errorMessage;
    }
}
