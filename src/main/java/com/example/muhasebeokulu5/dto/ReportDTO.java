package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    
    // Problem Raporları
    private Long totalProblems;
    private Map<String, Long> problemsByDifficulty;
    private List<ProblemStatsDTO> topProblems;
    private List<DailyProblemDTO> dailyProblemStats;
    
    // Kullanıcı Raporları
    private Long totalUsers;
    private Long activeUsers;
    private Long newUsersThisWeek;
    private List<UserStatsDTO> topUsers;
    private List<DailyUserDTO> dailyUserStats;
    
    // Performans Analizi
    private Double averageSuccessRate;
    private Long totalSolutions;
    private Long solutionsThisWeek;
    private List<PerformanceMetricsDTO> performanceMetrics;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemStatsDTO {
        private Long problemId;
        private String title;
        private String difficulty;
        private Long solveCount;
        private Double successRate;
        private LocalDateTime createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatsDTO {
        private String username;
        private String firstName;
        private String lastName;
        private Integer totalScore;
        private Integer solvedCount;
        private LocalDateTime lastActiveDate;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyProblemDTO {
        private String date;
        private Long problemCount;
        private Long solutionCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyUserDTO {
        private String date;
        private Long newUsers;
        private Long activeUsers;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetricsDTO {
        private String metric;
        private Double value;
        private String unit;
        private String trend; // "UP", "DOWN", "STABLE"
    }
}
