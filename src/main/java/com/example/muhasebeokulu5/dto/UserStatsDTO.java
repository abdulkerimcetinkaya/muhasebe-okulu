package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private long totalProblems;      // Sistemdeki toplam problem sayısı
    private long solvedProblems;     // Kullanıcının doğru çözdüğü problem sayısı
    private long attemptedProblems;  // Kullanıcının denediği (en az 1 cevap gönderdiği) problem sayısı
    private int successRate;         // Başarı oranı: (çözülen / denenen) * 100
}
