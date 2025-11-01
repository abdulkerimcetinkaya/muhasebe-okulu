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
public class QuestionDTO {

    private Long id;

    @NotNull(message = "Quiz ID gereklidir")
    private Long quizId;

    @NotBlank(message = "Soru metni boş olamaz")
    @Size(max = 2000, message = "Soru metni maksimum 2000 karakter olabilir")
    private String questionText;

    @Min(value = 1, message = "Soru sırası en az 1 olmalıdır")
    private Integer questionOrder;

    @NotNull(message = "Puan gereklidir")
    @Min(value = 1, message = "Puan en az 1 olmalıdır")
    @Max(value = 100, message = "Puan en fazla 100 olabilir")
    private Integer points;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @NotEmpty(message = "En az bir şık gereklidir")
    private List<OptionDTO> options;
}
