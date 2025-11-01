package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionDTO {

    @NotNull(message = "Quiz ID gereklidir")
    private Long quizId;

    @NotNull(message = "Kullanıcı ID gereklidir")
    private UUID userId;

    @NotEmpty(message = "En az bir cevap gereklidir")
    private List<AnswerDTO> answers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerDTO {
        @NotNull(message = "Soru ID gereklidir")
        private Long questionId;

        @NotNull(message = "Seçilen şık ID gereklidir")
        private Long selectedOptionId;
    }
}
