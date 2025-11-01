package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizDTO {

    private Long id;

    @NotBlank(message = "Quiz başlığı boş olamaz")
    @Size(max = 200, message = "Başlık maksimum 200 karakter olabilir")
    private String title;

    @Size(max = 1000, message = "Açıklama maksimum 1000 karakter olabilir")
    private String description;

    private Long topicId;
    private String topicName;

    @Min(value = 1, message = "Süre en az 1 dakika olmalıdır")
    @Max(value = 180, message = "Süre en fazla 180 dakika olabilir")
    private Integer timeLimitMinutes;

    @NotNull(message = "Zorluk seviyesi gereklidir")
    @Min(value = 1, message = "Zorluk seviyesi 1-3 arasında olmalıdır")
    @Max(value = 3, message = "Zorluk seviyesi 1-3 arasında olmalıdır")
    private Integer difficulty;

    @NotNull(message = "Geçme yüzdesi gereklidir")
    @Min(value = 0, message = "Geçme yüzdesi 0-100 arasında olmalıdır")
    @Max(value = 100, message = "Geçme yüzdesi 0-100 arasında olmalıdır")
    private Integer passPercentage;

    private Boolean isActive;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Integer questionCount; // Toplam soru sayısı
    private Integer totalPoints; // Toplam puan
    private List<QuestionDTO> questions; // Sorular (detaylı görünüm için)
}
