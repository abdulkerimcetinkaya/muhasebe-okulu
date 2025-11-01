package com.example.muhasebeokulu5.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class CheckSolutionRequest {

    @NotNull(message = "Problem ID boş olamaz")
    private Long problemId;

    private String userId;

    // Room functionality has been archived

    @NotEmpty(message = "En az bir kayıt girilmelidir")
    @Valid
    private List<EntryLine> entries;

    @Data
    public static class EntryLine {

        @NotNull(message = "Hesap kodu boş olamaz")
        @Size(min = 3, max = 10, message = "Hesap kodu 3-10 karakter arasında olmalıdır")
        private String accountCode;

        @NotNull(message = "Borç tutarı girilmelidir")
        @PositiveOrZero(message = "Borç tutarı negatif olamaz")
        private java.math.BigDecimal debit;

        @NotNull(message = "Alacak tutarı girilmelidir")
        @PositiveOrZero(message = "Alacak tutarı negatif olamaz")
        private java.math.BigDecimal credit;
    }
}






