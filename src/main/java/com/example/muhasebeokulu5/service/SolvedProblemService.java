package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.UserEntryDTO;
import com.example.muhasebeokulu5.dto.CheckSolutionRequest;
import com.example.muhasebeokulu5.entities.*;
import com.example.muhasebeokulu5.exception.ResourceNotFoundException;
import com.example.muhasebeokulu5.exception.BadRequestException;
import com.example.muhasebeokulu5.repository.*;
import com.example.muhasebeokulu5.util.RankUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.muhasebeokulu5.dto.SolvedProblemSummaryDTO;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolvedProblemService {

    // Epsilon tolerance: 0.01 TL (1 kuruş) - Floating point precision hataları için
    private static final BigDecimal EPSILON = new BigDecimal("0.01");

    private final ProblemRepository problemRepository;
    private final CorrectEntryRepository correctEntryRepository;
    private final SolvedProblemRepository solvedProblemRepository;
    private final UserRepository userRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final LevelService levelService;
    private final UserCategoryPerformanceRepository categoryPerformanceRepository;

    public record CheckResult(boolean balanced, boolean correct, String message) {}

    @Transactional
    public CheckResult checkSolution(CheckSolutionRequest request) {
        try {
            // ✅ Validasyon
            if (request.getProblemId() == null) {
                throw new BadRequestException("Problem ID boş olamaz");
            }
            if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }
            if (request.getEntries() == null || request.getEntries().isEmpty()) {
                throw new BadRequestException("Yevmiye kayıtları boş olamaz");
            }

            var problem = problemRepository.findById(request.getProblemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Problem bulunamadı (ID: " + request.getProblemId() + ")"));

            // String userId'yi UUID'ye çevir
            UUID userId;
            try {
                userId = UUID.fromString(request.getUserId());
            } catch (Exception e) {
                throw new BadRequestException("Geçersiz kullanıcı ID formatı: " + request.getUserId());
            }
            
            var user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı (ID: " + userId + ")"));

            // Room functionality has been archived
            // Genel problemlerde sınırsız deneme hakkı var, sadece ilk doğru çözümde puan verilir

            // Kullanıcının cevaplarını UserAnswer tablosuna kaydet (deneme kaydı için)
            for (CheckSolutionRequest.EntryLine entry : request.getEntries()) {
                UserAnswer userAnswer = new UserAnswer();
                userAnswer.setUser(user);
                userAnswer.setProblem(problem);
                userAnswer.setAccountCode(entry.getAccountCode());
                userAnswer.setDebit(entry.getDebit() != null ? entry.getDebit().doubleValue() : 0.0);
                userAnswer.setCredit(entry.getCredit() != null ? entry.getCredit().doubleValue() : 0.0);
                userAnswer.setDescription(""); // EntryLine'da description alanı yok
                userAnswerRepository.save(userAnswer);
            }

            boolean balanced = isBalanced(request.getEntries());
            boolean correct = isCorrect(request.getEntries(), problem.getId());

            // Puan hesaplama - Zorluk seviyesine göre
            int points = problem.getDifficulty().getPoints();

            String message = balanced
                    ? (correct ? "✅ Tebrikler! Problem doğru çözüldü." : "⚠️ Kayıt dengeli ama yanlış hesaplar var.")
                    : "⚠️ Kayıt dengesiz!";

            if (balanced && correct) {
                // SolvedProblem kaydı ve puan kazanımı (sadece ilk doğru çözümde)
                // Daha önce doğru çözmüş mü kontrol et
                boolean alreadySolvedCorrectly = solvedProblemRepository.existsByUserIdAndProblemId(
                    user.getId(), problem.getId()
                );

                if (!alreadySolvedCorrectly) {
                    // 🎯 LEVEL SYSTEM: Calculate attempt count (how many times user tried this problem)
                    long attemptCount = userAnswerRepository.countByUserIdAndProblemId(user.getId(), problem.getId());
                    int finalAttemptCount = (int) Math.ceil((double) attemptCount / request.getEntries().size());
                    if (finalAttemptCount < 1) finalAttemptCount = 1; // Minimum 1 attempt

                    // İlk doğru çözüm - puan ve yıldız kazan
                    SolvedProblem solved = new SolvedProblem();
                    solved.setProblem(problem);
                    solved.setUser(user);
                    solved.setBalanced(true);
                    solved.setCorrect(true);
                    solved.setEarnedPoints(points);
                    solved.setAttemptCount(finalAttemptCount);  // 🎯 Track attempts
                    solvedProblemRepository.save(solved);

                    // ⭐ Yıldız Sistemi - Kazanılan puanlara göre yıldız kazan
                    int starsEarned = RankUtil.getStarsForPoints(points);

                    // 🎯 İlk denemede doğru çözüm bonusu (attemptCount zaten yukarıda tanımlı)
                    boolean firstTry = (finalAttemptCount == 1); // İlk deneme
                    if (firstTry) {
                        starsEarned += RankUtil.getFirstTryBonus();
                    }

                    // Eski puan sistemini güncelle
                    user.setTotalScore(user.getTotalScore() + points);
                    user.setSolvedCount(user.getSolvedCount() + 1);

                    // ⭐ Yıldızları güncelle
                    int previousStars = user.getTotalStars();
                    user.setTotalStars(previousStars + starsEarned);
                    if (firstTry) {
                        user.setBonusStars(user.getBonusStars() + RankUtil.getFirstTryBonus());
                    }

                    // 🔥 Streak hesaplama ve güncelleme
                    updateUserStreak(user);

                    // 🔥 Streak bonusu yıldızları
                    if (user.getCurrentStreak() > 0 && user.getCurrentStreak() % 7 == 0) {
                        int streakBonus = RankUtil.getStreakBonus(user.getCurrentStreak());
                        user.setTotalStars(user.getTotalStars() + streakBonus);
                        user.setBonusStars(user.getBonusStars() + streakBonus);
                    }

                    // Son aktivite tarihini güncelle
                    user.setLastActivityDate(LocalDate.now());

                    // 🎯 LEVEL SYSTEM: Award points and check for level up
                    user = levelService.awardPointsAndCheckLevelUp(user, finalAttemptCount);

                    // 🎯 LEVEL SYSTEM: Update category performance (if problem has category)
                    if (problem.getCategory() != null && !problem.getCategory().isEmpty()) {
                        updateCategoryPerformance(user, problem.getCategory(), true, finalAttemptCount);
                    }

                    userRepository.save(user);

                    // Unvan bilgisini al
                    RankUtil.RankInfo rankInfo = RankUtil.getRankInfo(user.getTotalStars());

                    // 🎯 Level info eklendi
                    message = String.format("✅ Tebrikler! Problem doğru çözüldü. ⭐ +%d yıldız kazandınız! (Toplam: %d ⭐ - %s %s) | Seviye: %d",
                            starsEarned, user.getTotalStars(), rankInfo.getRankIcon(), rankInfo.getRankName(), user.getCurrentLevel());
                } else {
                    // Daha önce doğru çözmüş - puan ve yıldız yok
                    message = "✅ Tebrikler! Problem doğru çözüldü. (Bu problemi daha önce çözdüğünüz için yıldız kazanmadınız)";
                }
            }

            // Room functionality has been archived

            return new CheckResult(balanced, correct, message);

        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e; // Custom exception'ları tekrar fırlat
        } catch (Exception e) {
            throw new RuntimeException("Problem çözümü kontrol edilirken hata oluştu: " + e.getMessage(), e);
        }
    }

    /**
     * 🎯 LEVEL SYSTEM: Update user's category performance statistics.
     * Tracks success rate and average attempts per category for adaptive learning.
     */
    private void updateCategoryPerformance(User user, String category, boolean isSuccess, int attemptCount) {
        UserCategoryPerformance performance = categoryPerformanceRepository
                .findByUserAndCategory(user, category)
                .orElse(UserCategoryPerformance.builder()
                        .user(user)
                        .category(category)
                        .build());

        performance.updatePerformance(isSuccess, attemptCount);

        categoryPerformanceRepository.save(performance);

        log.debug("Updated category performance for user {}: category={}, success={}, attempts={}",
                user.getUsername(), category, isSuccess, attemptCount);
    }

    /**
     * Kullanıcının streak bilgilerini günceller (Yıldız Sistemi)
     */
    private void updateUserStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = user.getLastActivityDate();

        if (lastActivity == null) {
            // İlk kez problem çözüyor
            user.setCurrentStreak(1);
            user.setBestStreak(1);
            // Geriye dönük uyumluluk için eski alanları da güncelle
            user.setDailyStreak(1);
            user.setMaxStreak(1);
        } else if (lastActivity.equals(today)) {
            // Bugün zaten problem çözmüş, streak değişmez
            // Sadece lastActivityDate güncellenir
        } else if (lastActivity.equals(today.minusDays(1))) {
            // Dün aktif olmuş, seri devam ediyor
            user.setCurrentStreak(user.getCurrentStreak() + 1);
            user.setDailyStreak(user.getDailyStreak() + 1);
        } else {
            // Seri kırılmış, yeni seri başlıyor
            user.setCurrentStreak(1);
            user.setDailyStreak(1);
        }

        // Maksimum seri güncelleme
        if (user.getCurrentStreak() > user.getBestStreak()) {
            user.setBestStreak(user.getCurrentStreak());
            user.setMaxStreak(user.getCurrentStreak());
        }

        // Son aktif tarih güncelleme (hem yeni hem eski alan)
        user.setLastActivityDate(today);
        user.setLastActiveDate(today);
    }

    private boolean isBalanced(List<CheckSolutionRequest.EntryLine> entries) {
        try {
            BigDecimal debit = entries.stream()
                    .map(e -> e.getDebit() != null ? e.getDebit() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal credit = entries.stream()
                    .map(e -> e.getCredit() != null ? e.getCredit() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Epsilon tolerance ile karşılaştırma - Floating point precision hataları için
            // Farkın mutlak değeri epsilon'dan küçükse dengeli kabul et
            BigDecimal difference = debit.subtract(credit).abs();
            return difference.compareTo(EPSILON) < 0;
        } catch (Exception e) {
            throw new RuntimeException("Denge kontrolü yapılırken hata oluştu: " + e.getMessage(), e);
        }
    }

    private boolean isCorrect(List<CheckSolutionRequest.EntryLine> userEntries, Long problemId) {
        try {
            List<CorrectEntry> correctEntries = correctEntryRepository.findByProblemId(problemId);

            if (correctEntries == null || correctEntries.isEmpty()) {
                throw new ResourceNotFoundException("Bu problem için doğru cevaplar tanımlanmamış");
            }

            if (userEntries.size() != correctEntries.size()) return false;

            for (CorrectEntry correct : correctEntries) {
                boolean match = userEntries.stream().anyMatch(u ->
                        u.getAccountCode().equals(correct.getAccountCode()) &&
                                u.getDebit().compareTo(BigDecimal.valueOf(correct.getDebit())) == 0 &&
                                u.getCredit().compareTo(BigDecimal.valueOf(correct.getCredit())) == 0
                );
                if (!match) return false;
            }
            return true;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Cevap kontrolü yapılırken hata oluştu: " + e.getMessage(), e);
        }
    }

    public List<SolvedProblem> getByUserId(java.util.UUID userId) {
        try {
            if (userId == null) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }
            return solvedProblemRepository.findByUserId(userId);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Çözülen problemler getirilirken hata oluştu: " + e.getMessage(), e);
        }
    }
    // ✅ Mevcut getByUserId metodunun ALTINA ekle

    /**
     * Öğrencinin bu problemi daha önce gönderip göndermediğini kontrol et
     */
    public boolean hasUserSubmitted(UUID userId, Long problemId) {
        // SolvedProblem kontrolü
        return solvedProblemRepository.existsByUserIdAndProblemId(userId, problemId);
    }

    public List<SolvedProblemSummaryDTO> getSolvedProblemsByUserId(UUID userId) {
        try {
            if (userId == null) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }

            List<SolvedProblem> solvedProblems = solvedProblemRepository.findByUserId(userId);

            return solvedProblems.stream()
                    .map(sp -> new SolvedProblemSummaryDTO(
                            sp.getProblem().getId(),
                            sp.getProblem().getTitle(),
                            sp.getEarnedPoints(),
                            sp.getSolvedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"))
                    ))
                    .collect(Collectors.toList());

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Çözülen problemler getirilirken hata oluştu: " + e.getMessage(), e);
        }
    }

    /**
     * Kullanıcının istatistiklerini döndürür:
     * - Toplam problem sayısı
     * - Çözülen problem sayısı
     * - Denenen problem sayısı
     * - Başarı oranı (çözülen / denenen * 100)
     */
    public com.example.muhasebeokulu5.dto.UserStatsDTO getUserStatistics(UUID userId) {
        try {
            if (userId == null) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }

            // Toplam problem sayısı
            long totalProblems = problemRepository.count();

            // Kullanıcının doğru çözdüğü problem sayısı
            long solvedProblems = solvedProblemRepository.countByUserId(userId);

            // Kullanıcının denediği (en az 1 cevap gönderdiği) problem sayısı
            long attemptedProblems = userAnswerRepository.countDistinctProblemsByUserId(userId);

            // ÖNEMLI: Denenen problem sayısı, çözülen problem sayısından az olamaz
            // (Çünkü bir problem çözülmüşse mutlaka denenmiştir)
            if (attemptedProblems < solvedProblems) {
                attemptedProblems = solvedProblems;
            }

            // Başarı oranı hesaplama (division by zero kontrolü)
            int successRate = attemptedProblems > 0
                ? (int) Math.round((solvedProblems * 100.0) / attemptedProblems)
                : 0;

            return new com.example.muhasebeokulu5.dto.UserStatsDTO(
                totalProblems,
                solvedProblems,
                attemptedProblems,
                successRate
            );

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Kullanıcı istatistikleri getirilirken hata oluştu: " + e.getMessage(), e);
        }
    }

}