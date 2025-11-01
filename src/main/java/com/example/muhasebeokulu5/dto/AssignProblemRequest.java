package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Odaya problem atama isteği
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignProblemRequest {

    @NotNull(message = "Problem ID boş olamaz")
    private Long problemId;  // Atanacak problem ID'si

    @Future(message = "Son teslim tarihi gelecekte olmalıdır")
    private LocalDateTime dueDate;  // Son teslim tarihi (opsiyonel)

    @Size(max = 1000, message = "Talimatlar maksimum 1000 karakter olabilir")
    private String instructions;  // Özel talimatlar (opsiyonel)

    @Min(value = 1, message = "Görüntüleme sırası en az 1 olmalıdır")
    private Integer displayOrder;  // Görüntüleme sırası (opsiyonel, otomatik sıralama için null bırakılabilir)
}
