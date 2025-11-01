package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.UserEntryDTO;
import com.example.muhasebeokulu5.dto.CheckSolutionRequest;
import com.example.muhasebeokulu5.entities.*;
import com.example.muhasebeokulu5.exception.ResourceNotFoundException;
import com.example.muhasebeokulu5.exception.BadRequestException;
import com.example.muhasebeokulu5.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.muhasebeokulu5.dto.SolvedProblemSummaryDTO;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolvedProblemService {

    private final ProblemRepository problemRepository;
    private final CorrectEntryRepository correctEntryRepository;
    private final SolvedProblemRepository solvedProblemRepository;
    private final UserRepository userRepository;
    private final UserAnswerRepository userAnswerRepository;

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
                    // İlk doğru çözüm - puan kazan
                    SolvedProblem solved = new SolvedProblem();
                    solved.setProblem(problem);
                    solved.setUser(user);
                    solved.setBalanced(true);
                    solved.setCorrect(true);
                    solved.setEarnedPoints(points);
                    solvedProblemRepository.save(solved);

                    user.setTotalScore(user.getTotalScore() + points);
                    user.setSolvedCount(user.getSolvedCount() + 1);

                    // Streak hesaplama ve güncelleme
                    updateUserStreak(user);

                    userRepository.save(user);

                    message = "✅ Tebrikler! Problem doğru çözüldü. +" + points + " puan kazandınız!";
                } else {
                    // Daha önce doğru çözmüş - puan yok
                    message = "✅ Tebrikler! Problem doğru çözüldü. (Bu problemi daha önce çözdüğünüz için puan kazanmadınız)";
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
     * Kullanıcının streak bilgilerini günceller
     */
    private void updateUserStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate lastActive = user.getLastActiveDate();
        
        if (lastActive == null) {
            // İlk kez problem çözüyor
            user.setDailyStreak(1);
            user.setMaxStreak(1);
        } else if (lastActive.equals(today)) {
            // Bugün zaten problem çözmüş, streak değişmez
            // Sadece lastActiveDate güncellenir
        } else if (lastActive.equals(today.minusDays(1))) {
            // Dün aktif olmuş, seri devam ediyor
            user.setDailyStreak(user.getDailyStreak() + 1);
        } else {
            // Seri kırılmış, yeni seri başlıyor
            user.setDailyStreak(1);
        }
        
        // Maksimum seri güncelleme
        if (user.getDailyStreak() > user.getMaxStreak()) {
            user.setMaxStreak(user.getDailyStreak());
        }
        
        // Son aktif tarih güncelleme
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

            return debit.compareTo(credit) == 0;
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

}