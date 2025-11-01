package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * Manuel puanlama isteği
 */
@Data
public class GradeAnswerRequest {

    @NotNull(message = "Cevap ID boş olamaz")
    private UUID answerId;           // UserAnswer ID

    @NotNull(message = "Puan girilmelidir")
    @Min(value = 0, message = "Puan 0'dan küçük olamaz")
    @Max(value = 100, message = "Puan 100'den büyük olamaz")
    private Integer score;            // Verilen puan

    @Size(max = 1000, message = "Geri bildirim maksimum 1000 karakter olabilir")
    private String feedback;          // Öğretmen yorumu (opsiyonel)
}
