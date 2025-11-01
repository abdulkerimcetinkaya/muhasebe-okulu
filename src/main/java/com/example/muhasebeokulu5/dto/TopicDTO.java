package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicDTO {

    private Long id;

    @NotBlank(message = "Konu adı boş olamaz")
    @Size(max = 200, message = "Konu adı maksimum 200 karakter olabilir")
    private String name;

    @Size(max = 1000, message = "Açıklama maksimum 1000 karakter olabilir")
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer quizCount; // İlişkili quiz sayısı
}
