package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Admin Dashboard İstatistikleri DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {

    // Kullanıcı İstatistikleri
    private Long totalUsers;
    private Long usersThisWeek;
    private Long activeUsers; // Son 7 günde aktif olan kullanıcılar

    // Problem İstatistikleri
    private Long totalProblems;
    private Map<String, Long> problemsByDifficulty; // {"EASY": 10, "MEDIUM": 15, "HARD": 5}

    // Çözüm İstatistikleri
    private Long totalSolutions;
    private Long solutionsThisWeek;
    private List<DailySolutionDTO> dailySolutions; // Son 7 günün günlük çözümleri

    // Top Listeler
    private List<TopProblemDTO> topSolvedProblems; // En çok çözülen 5 problem
    private List<TopUserDTO> topUsers; // En aktif 3 kullanıcı

    /**
     * Günlük Çözüm DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySolutionDTO {
        private LocalDate date;
        private Long count;
    }

    /**
     * En Çok Çözülen Problem DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProblemDTO {
        private Long id;
        private String title;
        private String difficulty;
        private Long solveCount;
    }

    /**
     * En Aktif Kullanıcı DTO
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopUserDTO {
        private String username;
        private Long solutionCount;
        private Integer rank;
    }
}
