package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.AdminDashboardDTO;
import com.example.muhasebeokulu5.entities.Difficulty;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import com.example.muhasebeokulu5.repository.SolvedProblemRepository;
import com.example.muhasebeokulu5.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SolvedProblemRepository solvedProblemRepository;

    public AdminDashboardDTO getDashboardStats() {
        try {
            log.info("Fetching dashboard stats...");
            AdminDashboardDTO dashboard = new AdminDashboardDTO();
            LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);

        // 1. Kullanıcı İstatistikleri
        dashboard.setTotalUsers(userRepository.count());
        dashboard.setUsersThisWeek(userRepository.countUsersCreatedAfter(weekAgo));
        dashboard.setActiveUsers(solvedProblemRepository.countActiveUsers(weekAgo));

        // 2. Problem İstatistikleri
        dashboard.setTotalProblems(problemRepository.count());

        // Zorluk seviyesine göre dağılım
        Map<String, Long> difficultyMap = new HashMap<>();
        difficultyMap.put("EASY", problemRepository.countByDifficulty(Difficulty.EASY));
        difficultyMap.put("MEDIUM", problemRepository.countByDifficulty(Difficulty.MEDIUM));
        difficultyMap.put("HARD", problemRepository.countByDifficulty(Difficulty.HARD));
        dashboard.setProblemsByDifficulty(difficultyMap);

        // En çok çözülen 5 problem
        List<Object[]> topProblemsRaw = solvedProblemRepository.findTopSolvedProblems();
        List<AdminDashboardDTO.TopProblemDTO> topProblems = topProblemsRaw.stream()
                .limit(5)
                .map(row -> new AdminDashboardDTO.TopProblemDTO(
                        (Long) row[0],           // problemId
                        (String) row[1],         // title
                        (Long) row[3],           // solveCount
                        row[2].toString()        // difficulty
                ))
                .collect(Collectors.toList());
        dashboard.setTopSolvedProblems(topProblems);

        // 3. Çözüm İstatistikleri
        dashboard.setTotalSolutions(solvedProblemRepository.count());
        dashboard.setSolutionsThisWeek(solvedProblemRepository.countSolutionsAfter(weekAgo));

        // Başarı oranı hesaplama (şimdilik 100% - ileride yanlış denemeler eklenirse değişir)
        Long totalSolutions = solvedProblemRepository.count();
        dashboard.setAverageSuccessRate(totalSolutions > 0 ? 100.0 : 0.0);

        // 4. Günlük Çözüm Verileri (Son 7 gün)
        List<Object[]> dailyRaw = solvedProblemRepository.findDailySolutions(weekAgo);
        List<AdminDashboardDTO.DailySolutionDTO> dailySolutions = dailyRaw.stream()
                .map(row -> new AdminDashboardDTO.DailySolutionDTO(
                        row[0].toString(),  // date
                        (Long) row[1]       // count
                ))
                .collect(Collectors.toList());
        dashboard.setDailySolutions(dailySolutions);

            log.info("Dashboard stats fetched successfully");
            return dashboard;
        } catch (Exception e) {
            log.error("Error fetching dashboard stats: ", e);
            throw new RuntimeException("Failed to fetch dashboard stats", e);
        }
    }
}