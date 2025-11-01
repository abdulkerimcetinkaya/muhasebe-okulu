package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDTO {

    // Kullanıcı İstatistikleri
    private Long totalUsers;
    private Long usersThisWeek;
    private Long activeUsers; // Son 7 gün içinde problem çözenler

    // Problem İstatistikleri
    private Long totalProblems;
    private Map<String, Long> problemsByDifficulty; // EASY: 10, MEDIUM: 5, HARD: 3
    private List<TopProblemDTO> topSolvedProblems; // En çok çözülen 5 problem

    // Çözüm İstatistikleri
    private Long totalSolutions;
    private Long solutionsThisWeek;
    private Double averageSuccessRate; // Toplam doğru çözüm / toplam deneme

    // Grafik Verileri
    private List<DailySolutionDTO> dailySolutions; // Son 7 gün

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProblemDTO {
        private Long problemId;
        private String title;
        private Long solveCount;
        private String difficulty;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySolutionDTO {
        private String date; // YYYY-MM-DD
        private Long count;
    }
}