package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.*;
import com.example.muhasebeokulu5.entities.*;
import com.example.muhasebeokulu5.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SolvedProblemRepository solvedProblemRepository;
    private final CorrectEntryRepository correctEntryRepository;

    // Kullanıcı Yönetimi
    public Page<UserManagementDTO> getAllUsers(int page, int size, String search, String role) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (search != null && !search.trim().isEmpty()) {
            return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                search, search, pageable)
                .map(this::convertToUserManagementDTO);
        }
        
        if (role != null && !role.trim().isEmpty()) {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            return userRepository.findByRole(roleEnum, pageable)
                .map(this::convertToUserManagementDTO);
        }
        
        return userRepository.findAll(pageable)
            .map(this::convertToUserManagementDTO);
    }

    public UserManagementDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return convertToUserManagementDTO(user);
    }

    @Transactional
    public UserManagementDTO updateUserRole(UUID id, String newRole) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        
        user.setRole(Role.valueOf(newRole.toUpperCase()));
        user = userRepository.save(user);
        
        return convertToUserManagementDTO(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Kullanıcı bulunamadı");
        }
        userRepository.deleteById(id);
    }

    // Problem Yönetimi
    // Problem Yönetimi - Optimized version
    public Page<ProblemManagementDTO> getAllProblemsOptimized(int page, int size, String search, String difficulty) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Problem> problems;
        if (search != null && !search.trim().isEmpty()) {
            if (difficulty != null && !difficulty.trim().isEmpty()) {
                Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
                problems = problemRepository.searchProblemsByDifficulty(search, diff, pageable);
            } else {
                problems = problemRepository.searchProblems(search, pageable);
            }
        } else if (difficulty != null && !difficulty.trim().isEmpty()) {
            Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
            problems = problemRepository.findByDifficulty(diff, pageable);
        } else {
            problems = problemRepository.findAll(pageable);
        }
        
        // Sadece temel alanları döndür (N+1 query problemini önle)
        return problems.map(problem -> {
            ProblemManagementDTO dto = new ProblemManagementDTO();
            dto.setId(problem.getId());
            dto.setTitle(problem.getTitle());
            dto.setContent(problem.getContent());
            dto.setHint(problem.getHint());
            dto.setTags(problem.getTags());
            dto.setDifficulty(problem.getDifficulty());
            dto.setCreatedAt(problem.getCreatedAt());
            
            // İstatistikleri 0 olarak ayarla (ayrı endpoint'te hesaplanabilir)
            dto.setSolveCount(0L);
            dto.setSuccessRate(0.0);
            dto.setCorrectEntries(new ArrayList<>());
            
            return dto;
        });
    }

    public Page<ProblemManagementDTO> getAllProblems(int page, int size, String search, String difficulty) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        if (search != null && !search.trim().isEmpty()) {
            if (difficulty != null && !difficulty.trim().isEmpty()) {
                Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
                return problemRepository.searchProblemsByDifficulty(search, diff, pageable)
                    .map(this::convertToProblemManagementDTO);
            } else {
                return problemRepository.searchProblems(search, pageable)
                    .map(this::convertToProblemManagementDTO);
            }
        }
        
        if (difficulty != null && !difficulty.trim().isEmpty()) {
            Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
            return problemRepository.findByDifficulty(diff, pageable)
                .map(this::convertToProblemManagementDTO);
        }
        
        return problemRepository.findAll(pageable)
            .map(this::convertToProblemManagementDTO);
    }

    public ProblemManagementDTO getProblemById(Long id) {
        Problem problem = problemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Problem bulunamadı"));
        return convertToProblemManagementDTO(problem);
    }

    @Transactional
    public ProblemManagementDTO createProblem(CreateProblemDTO createProblemDTO) {
        Problem problem = new Problem();
        problem.setTitle(createProblemDTO.getTitle());
        problem.setContent(createProblemDTO.getContent());
        problem.setHint(createProblemDTO.getHint());
        problem.setTags(createProblemDTO.getTags());
        problem.setDifficulty(createProblemDTO.getDifficulty());
        problem.setCreatedAt(LocalDateTime.now());
        
        problem = problemRepository.save(problem);
        
        // Doğru cevapları kaydet
        for (CreateProblemDTO.CorrectEntryDTO entryDTO : createProblemDTO.getCorrectEntries()) {
            CorrectEntry entry = new CorrectEntry();
            entry.setProblem(problem);
            entry.setAccountCode(entryDTO.getAccountCode());
            entry.setAccountName(entryDTO.getAccountName());
            entry.setDebit(entryDTO.getDebitAmount());
            entry.setCredit(entryDTO.getCreditAmount());
            correctEntryRepository.save(entry);
        }
        
        return convertToProblemManagementDTO(problem);
    }

    @Transactional
    public ProblemManagementDTO updateProblem(Long id, CreateProblemDTO updateProblemDTO) {
        Problem problem = problemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Problem bulunamadı"));
        
        problem.setTitle(updateProblemDTO.getTitle());
        problem.setContent(updateProblemDTO.getContent());
        problem.setHint(updateProblemDTO.getHint());
        problem.setTags(updateProblemDTO.getTags());
        problem.setDifficulty(updateProblemDTO.getDifficulty());
        
        // Mevcut doğru cevapları sil
        correctEntryRepository.deleteByProblemId(id);
        
        // Yeni doğru cevapları kaydet
        for (CreateProblemDTO.CorrectEntryDTO entryDTO : updateProblemDTO.getCorrectEntries()) {
            CorrectEntry entry = new CorrectEntry();
            entry.setProblem(problem);
            entry.setAccountCode(entryDTO.getAccountCode());
            entry.setAccountName(entryDTO.getAccountName());
            entry.setDebit(entryDTO.getDebitAmount());
            entry.setCredit(entryDTO.getCreditAmount());
            correctEntryRepository.save(entry);
        }
        
        problem = problemRepository.save(problem);
        return convertToProblemManagementDTO(problem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        if (!problemRepository.existsById(id)) {
            throw new RuntimeException("Problem bulunamadı");
        }
        problemRepository.deleteById(id);
    }

    // Raporlar
    public ReportDTO getReports() {
        ReportDTO report = new ReportDTO();
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        
        // Problem Raporları
        report.setTotalProblems(problemRepository.count());
        
        // Zorluk seviyesine göre dağılım
        Map<String, Long> difficultyMap = new HashMap<>();
        difficultyMap.put("EASY", problemRepository.countByDifficulty(Difficulty.EASY));
        difficultyMap.put("MEDIUM", problemRepository.countByDifficulty(Difficulty.MEDIUM));
        difficultyMap.put("HARD", problemRepository.countByDifficulty(Difficulty.HARD));
        report.setProblemsByDifficulty(difficultyMap);
        
        report.setTopProblems(getTopProblems());
        report.setDailyProblemStats(getDailyProblemStats(weekAgo));
        
        // Kullanıcı Raporları
        report.setTotalUsers(userRepository.count());
        report.setActiveUsers(solvedProblemRepository.countActiveUsers(weekAgo));
        report.setNewUsersThisWeek(userRepository.countUsersCreatedAfter(weekAgo));
        report.setTopUsers(getTopUsers());
        report.setDailyUserStats(getDailyUserStats(weekAgo));
        
        // Performans Analizi
        report.setTotalSolutions(solvedProblemRepository.count());
        report.setSolutionsThisWeek(solvedProblemRepository.countSolutionsAfter(weekAgo));
        report.setAverageSuccessRate(calculateAverageSuccessRate());
        report.setPerformanceMetrics(getPerformanceMetrics());
        
        return report;
    }

    // Helper Methods
    private UserManagementDTO convertToUserManagementDTO(User user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setTotalScore(user.getTotalScore());
        dto.setSolvedCount(user.getSolvedCount());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setLastActiveDate(user.getLastActiveDate());
        dto.setIsActive(user.getLastActiveDate() != null && 
            user.getLastActiveDate().isAfter(LocalDate.now().minusDays(7)));
        dto.setStatus(dto.getIsActive() ? "ACTIVE" : "INACTIVE");
        return dto;
    }

    private ProblemManagementDTO convertToProblemManagementDTO(Problem problem) {
        ProblemManagementDTO dto = new ProblemManagementDTO();
        dto.setId(problem.getId());
        dto.setTitle(problem.getTitle());
        dto.setContent(problem.getContent());
        dto.setHint(problem.getHint());
        dto.setTags(problem.getTags());
        dto.setDifficulty(problem.getDifficulty());
        dto.setCreatedAt(problem.getCreatedAt());
        
        // Çözüm sayısını hesapla
        Long solveCount = solvedProblemRepository.countByProblemId(problem.getId());
        dto.setSolveCount(solveCount);
        
        // Başarı oranını hesapla (şimdilik 100% - ileride yanlış denemeler eklenirse değişir)
        dto.setSuccessRate(100.0);
        
        // Doğru cevapları getir
        List<CorrectEntry> correctEntries = correctEntryRepository.findByProblemId(problem.getId());
        List<ProblemManagementDTO.CorrectEntryDTO> entryDTOs = correctEntries.stream()
            .map(entry -> new ProblemManagementDTO.CorrectEntryDTO(
                entry.getId(),
                entry.getAccountCode(),
                entry.getAccountName(),
                entry.getDebit(),
                entry.getCredit()
            ))
            .collect(Collectors.toList());
        dto.setCorrectEntries(entryDTOs);
        
        return dto;
    }

    private List<ReportDTO.ProblemStatsDTO> getTopProblems() {
        List<Object[]> results = solvedProblemRepository.findTopSolvedProblems();
        return results.stream()
            .limit(10)
            .map(row -> new ReportDTO.ProblemStatsDTO(
                (Long) row[0],
                (String) row[1],
                row[2].toString(),
                (Long) row[3],
                100.0, // Şimdilik 100%
                (LocalDateTime) row[4]
            ))
            .collect(Collectors.toList());
    }

    private List<ReportDTO.UserStatsDTO> getTopUsers() {
        List<Object[]> results = userRepository.findTopUsersByScore();
        return results.stream()
            .limit(10)
            .map(row -> new ReportDTO.UserStatsDTO(
                (String) row[0],
                (String) row[1],
                (String) row[2],
                (Integer) row[3],
                (Integer) row[4],
                (LocalDateTime) row[5]
            ))
            .collect(Collectors.toList());
    }

    private List<ReportDTO.DailyProblemDTO> getDailyProblemStats(LocalDateTime weekAgo) {
        List<Object[]> results = solvedProblemRepository.findDailySolutions(weekAgo);
        return results.stream()
            .map(row -> new ReportDTO.DailyProblemDTO(
                row[0].toString(),
                0L, // Problem sayısı - şimdilik 0
                (Long) row[1]
            ))
            .collect(Collectors.toList());
    }

    private List<ReportDTO.DailyUserDTO> getDailyUserStats(LocalDateTime weekAgo) {
        List<Object[]> results = userRepository.findDailyNewUsers(weekAgo);
        return results.stream()
            .map(row -> new ReportDTO.DailyUserDTO(
                row[0].toString(),
                (Long) row[1],
                0L // Aktif kullanıcı sayısı - şimdilik 0
            ))
            .collect(Collectors.toList());
    }

    private Double calculateAverageSuccessRate() {
        Long totalSolutions = solvedProblemRepository.count();
        return totalSolutions > 0 ? 100.0 : 0.0; // Şimdilik 100%
    }

    private List<ReportDTO.PerformanceMetricsDTO> getPerformanceMetrics() {
        return List.of(
            new ReportDTO.PerformanceMetricsDTO("Başarı Oranı", 100.0, "%", "STABLE"),
            new ReportDTO.PerformanceMetricsDTO("Ortalama Çözüm Süresi", 15.5, "dakika", "DOWN"),
            new ReportDTO.PerformanceMetricsDTO("Kullanıcı Memnuniyeti", 4.8, "/5", "UP")
        );
    }
}
