package com.example.muhasebeokulu5.dto;

import com.example.muhasebeokulu5.entities.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProblemDTO {

    @NotBlank(message = "Problem başlığı boş olamaz")
    @Size(min = 5, max = 200, message = "Başlık 5-200 karakter arasında olmalıdır")
    private String title;

    @NotBlank(message = "Problem içeriği boş olamaz")
    @Size(min = 10, max = 5000, message = "İçerik 10-5000 karakter arasında olmalıdır")
    private String content;

    @Size(max = 500, message = "İpucu maksimum 500 karakter olabilir")
    private String hint;

    @Size(max = 200, message = "Etiketler maksimum 200 karakter olabilir")
    private String tags;

    @NotNull(message = "Zorluk seviyesi boş olamaz")
    private Difficulty difficulty;

    // Room-specific isPrivate field has been archived

    @NotEmpty(message = "En az bir doğru kayıt girilmelidir")
    @Valid
    private List<CorrectEntryDTO> correctEntries;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CorrectEntryDTO {

        @NotBlank(message = "Hesap kodu boş olamaz")
        @Size(min = 3, max = 10, message = "Hesap kodu 3-10 karakter arasında olmalıdır")
        private String accountCode;

        @NotBlank(message = "Hesap adı boş olamaz")
        @Size(min = 2, max = 100, message = "Hesap adı 2-100 karakter arasında olmalıdır")
        private String accountName;

        @PositiveOrZero(message = "Borç tutarı negatif olamaz")
        private Double debitAmount;

        @PositiveOrZero(message = "Alacak tutarı negatif olamaz")
        private Double creditAmount;
    }
}
