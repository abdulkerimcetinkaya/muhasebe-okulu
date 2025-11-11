package com.example.muhasebeokulu5.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for bulk question import
 * Allows importing multiple questions at once via JSON
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkQuestionImportDTO {

    @NotNull(message = "Quiz ID gereklidir")
    private Long quizId;

    @NotEmpty(message = "Soru listesi boş olamaz")
    @Valid
    private List<QuestionImportItem> questions;

    /**
     * Individual question for import (without quizId since it's in parent)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionImportItem {

        @NotEmpty(message = "Soru metni boş olamaz")
        private String questionText;

        private Integer questionOrder;

        @NotNull(message = "Puan gereklidir")
        private Integer points;

        @NotEmpty(message = "En az bir şık gereklidir")
        @Valid
        private List<OptionImportItem> options;
    }

    /**
     * Individual option for import
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionImportItem {

        @NotEmpty(message = "Şık metni boş olamaz")
        private String optionText;

        @NotNull(message = "Doğru/yanlış durumu belirtilmelidir")
        private Boolean isCorrect;

        private Integer optionOrder;
    }

    /**
     * Import result summary
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportResult {
        private int totalQuestions;
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
        private int questionIndex;  // 0-based index in the input list
        private String questionText;
        private String errorMessage;
    }
}
