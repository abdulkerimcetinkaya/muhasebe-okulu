package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptionDTO {

    private Long id;

    private Long questionId;

    @NotBlank(message = "Şık metni boş olamaz")
    @Size(max = 1000, message = "Şık metni maksimum 1000 karakter olabilir")
    private String optionText;

    @NotNull(message = "Doğru/yanlış durumu belirtilmelidir")
    private Boolean isCorrect;

    private Integer optionOrder;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
