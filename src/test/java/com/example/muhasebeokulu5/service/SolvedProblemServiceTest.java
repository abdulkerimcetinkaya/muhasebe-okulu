package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.CheckSolutionRequest;
import com.example.muhasebeokulu5.entities.*;
import com.example.muhasebeokulu5.exception.BadRequestException;
import com.example.muhasebeokulu5.exception.ResourceNotFoundException;
import com.example.muhasebeokulu5.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SolvedProblemService Tests - Epsilon Tolerance & Streak Logic")
class SolvedProblemServiceTest {

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private CorrectEntryRepository correctEntryRepository;

    @Mock
    private SolvedProblemRepository solvedProblemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserAnswerRepository userAnswerRepository;

    @InjectMocks
    private SolvedProblemService solvedProblemService;

    private User testUser;
    private Problem testProblem;
    private List<CorrectEntry> correctEntries;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setTotalScore(0);
        testUser.setSolvedCount(0);
        testUser.setTotalStars(0);
        testUser.setBonusStars(0);
        testUser.setCurrentStreak(0);
        testUser.setBestStreak(0);
        testUser.setDailyStreak(0);
        testUser.setMaxStreak(0);
        testUser.setLastActivityDate(null);
        testUser.setLastActiveDate(null);

        // Setup test problem
        testProblem = new Problem();
        testProblem.setId(1L);
        testProblem.setTitle("Test Problem");
        testProblem.setDifficulty(Difficulty.EASY);

        // Setup correct entries: 100 TL debit, 100 TL credit
        CorrectEntry entry1 = new CorrectEntry();
        entry1.setAccountCode("100");
        entry1.setDebit(100.0);
        entry1.setCredit(0.0);

        CorrectEntry entry2 = new CorrectEntry();
        entry2.setAccountCode("320");
        entry2.setDebit(0.0);
        entry2.setCredit(100.0);

        correctEntries = Arrays.asList(entry1, entry2);
    }

    // ==================== EPSILON TOLERANCE TESTS ====================

    @Test
    @DisplayName("Epsilon Test: 0.005 TL fark dengeli kabul edilmeli")
    void testEpsilonTolerance_SmallDifference_ShouldBeBalanced() {
        // Given: 0.005 TL difference (within epsilon tolerance of 0.01)
        CheckSolutionRequest.EntryLine line1 = new CheckSolutionRequest.EntryLine();
        line1.setAccountCode("100");
        line1.setDebit(new BigDecimal("100.000"));
        line1.setCredit(BigDecimal.ZERO);

        CheckSolutionRequest.EntryLine line2 = new CheckSolutionRequest.EntryLine();
        line2.setAccountCode("320");
        line2.setDebit(BigDecimal.ZERO);
        line2.setCredit(new BigDecimal("100.005"));  // 0.005 TL difference

        CheckSolutionRequest request = new CheckSolutionRequest();
        request.setProblemId(1L);
        request.setUserId(testUser.getId().toString());
        request.setEntries(Arrays.asList(line1, line2));

        // Mock repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        SolvedProblemService.CheckResult result = solvedProblemService.checkSolution(request);

        // Then
        assertThat(result.balanced()).isTrue();
        assertThat(result.message()).contains("dengeli");
    }

    @Test
    @DisplayName("Epsilon Test: 0.02 TL fark dengesiz kabul edilmeli")
    void testEpsilonTolerance_LargeDifference_ShouldBeUnbalanced() {
        // Given: 0.02 TL difference (exceeds epsilon tolerance of 0.01)
        CheckSolutionRequest.EntryLine line1 = new CheckSolutionRequest.EntryLine();
        line1.setAccountCode("100");
        line1.setDebit(new BigDecimal("100.00"));
        line1.setCredit(BigDecimal.ZERO);

        CheckSolutionRequest.EntryLine line2 = new CheckSolutionRequest.EntryLine();
        line2.setAccountCode("320");
        line2.setDebit(BigDecimal.ZERO);
        line2.setCredit(new BigDecimal("100.02"));  // 0.02 TL difference

        CheckSolutionRequest request = new CheckSolutionRequest();
        request.setProblemId(1L);
        request.setUserId(testUser.getId().toString());
        request.setEntries(Arrays.asList(line1, line2));

        // Mock repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        // When
        SolvedProblemService.CheckResult result = solvedProblemService.checkSolution(request);

        // Then
        assertThat(result.balanced()).isFalse();
        assertThat(result.message()).contains("dengesiz");
    }

    @Test
    @DisplayName("Epsilon Test: Tam dengeli kayıt (0 TL fark)")
    void testEpsilonTolerance_ExactBalance_ShouldBeBalanced() {
        // Given: Exact balance (0 TL difference)
        CheckSolutionRequest.EntryLine line1 = new CheckSolutionRequest.EntryLine();
        line1.setAccountCode("100");
        line1.setDebit(new BigDecimal("100.00"));
        line1.setCredit(BigDecimal.ZERO);

        CheckSolutionRequest.EntryLine line2 = new CheckSolutionRequest.EntryLine();
        line2.setAccountCode("320");
        line2.setDebit(BigDecimal.ZERO);
        line2.setCredit(new BigDecimal("100.00"));

        CheckSolutionRequest request = new CheckSolutionRequest();
        request.setProblemId(1L);
        request.setUserId(testUser.getId().toString());
        request.setEntries(Arrays.asList(line1, line2));

        // Mock repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        SolvedProblemService.CheckResult result = solvedProblemService.checkSolution(request);

        // Then
        assertThat(result.balanced()).isTrue();
        assertThat(result.correct()).isTrue();
    }

    // ==================== STREAK CALCULATION TESTS ====================

    @Test
    @DisplayName("Streak Test: İlk kez problem çözen kullanıcı (streak = 1)")
    void testStreakCalculation_FirstTimeSolver_ShouldInitializeStreak() {
        // Given: User with no previous activity
        testUser.setLastActivityDate(null);

        CheckSolutionRequest request = createValidRequest();

        // Mock all required repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        solvedProblemService.checkSolution(request);

        // Then: Verify streak initialized to 1
        verify(userRepository).save(argThat(user ->
            user.getCurrentStreak() == 1 &&
            user.getBestStreak() == 1 &&
            user.getDailyStreak() == 1 &&
            user.getMaxStreak() == 1
        ));
    }

    @Test
    @DisplayName("Streak Test: Aynı gün birden fazla problem çözme (streak değişmez)")
    void testStreakCalculation_SameDayMultipleSolves_ShouldNotChangeStreak() {
        // Given: User solved a problem today
        testUser.setLastActivityDate(LocalDate.now());
        testUser.setCurrentStreak(5);
        testUser.setBestStreak(5);
        testUser.setDailyStreak(5);
        testUser.setMaxStreak(5);

        CheckSolutionRequest request = createValidRequest();

        // Mock all required repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        solvedProblemService.checkSolution(request);

        // Then: Streak should remain unchanged
        verify(userRepository).save(argThat(user ->
            user.getCurrentStreak() == 5 &&
            user.getBestStreak() == 5
        ));
    }

    @Test
    @DisplayName("Streak Test: Ardışık günler (dün aktif, bugün çözüm - streak artmalı)")
    void testStreakCalculation_ConsecutiveDays_ShouldIncrementStreak() {
        // Given: User was active yesterday
        testUser.setLastActivityDate(LocalDate.now().minusDays(1));
        testUser.setCurrentStreak(3);
        testUser.setBestStreak(5);
        testUser.setDailyStreak(3);
        testUser.setMaxStreak(5);

        CheckSolutionRequest request = createValidRequest();

        // Mock all required repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        solvedProblemService.checkSolution(request);

        // Then: Streak should increment to 4
        verify(userRepository).save(argThat(user ->
            user.getCurrentStreak() == 4 &&
            user.getDailyStreak() == 4
        ));
    }

    @Test
    @DisplayName("Streak Test: Seri kırıldı (2+ gün aradan sonra - streak sıfırlanmalı)")
    void testStreakCalculation_StreakBroken_ShouldResetToOne() {
        // Given: User was active 3 days ago (streak broken)
        testUser.setLastActivityDate(LocalDate.now().minusDays(3));
        testUser.setCurrentStreak(7);
        testUser.setBestStreak(10);
        testUser.setDailyStreak(7);
        testUser.setMaxStreak(10);

        CheckSolutionRequest request = createValidRequest();

        // Mock all required repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        solvedProblemService.checkSolution(request);

        // Then: Streak should reset to 1, best streak should remain 10
        verify(userRepository).save(argThat(user ->
            user.getCurrentStreak() == 1 &&
            user.getDailyStreak() == 1 &&
            user.getBestStreak() == 10  // Best streak preserved
        ));
    }

    @Test
    @DisplayName("Streak Test: Yeni rekor streak (current > best)")
    void testStreakCalculation_NewRecordStreak_ShouldUpdateBestStreak() {
        // Given: User's current streak will exceed best streak
        testUser.setLastActivityDate(LocalDate.now().minusDays(1));
        testUser.setCurrentStreak(9);
        testUser.setBestStreak(9);
        testUser.setDailyStreak(9);
        testUser.setMaxStreak(9);

        CheckSolutionRequest request = createValidRequest();

        // Mock all required repository calls
        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        solvedProblemService.checkSolution(request);

        // Then: Both current and best streak should be 10
        verify(userRepository).save(argThat(user ->
            user.getCurrentStreak() == 10 &&
            user.getBestStreak() == 10 &&
            user.getMaxStreak() == 10
        ));
    }

    // ==================== DUPLICATE SOLVE TESTS ====================

    @Test
    @DisplayName("Duplicate Solve: Daha önce çözülmüş problem - puan kazanılmamalı")
    void testDuplicateSolve_AlreadySolved_ShouldNotAwardPoints() {
        // Given: User already solved this problem
        CheckSolutionRequest request = createValidRequest();

        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(true);  // Already solved

        // When
        SolvedProblemService.CheckResult result = solvedProblemService.checkSolution(request);

        // Then: Should get success message but no points
        assertThat(result.balanced()).isTrue();
        assertThat(result.correct()).isTrue();
        assertThat(result.message()).contains("daha önce çözdüğünüz için yıldız kazanmadınız");

        // Verify NO new SolvedProblem record created
        verify(solvedProblemRepository, never()).save(any(SolvedProblem.class));

        // Verify user score/stars NOT updated
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Duplicate Solve: İlk doğru çözüm - puan ve yıldız kazanılmalı")
    void testFirstCorrectSolve_ShouldAwardPointsAndStars() {
        // Given: First time solving correctly
        CheckSolutionRequest request = createValidRequest();

        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(correctEntryRepository.findByProblemId(1L)).thenReturn(correctEntries);
        when(solvedProblemRepository.existsByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(false);  // First solve
        when(userAnswerRepository.countByUserIdAndProblemId(testUser.getId(), 1L)).thenReturn(2L);

        // When
        SolvedProblemService.CheckResult result = solvedProblemService.checkSolution(request);

        // Then: Should award points and stars
        assertThat(result.balanced()).isTrue();
        assertThat(result.correct()).isTrue();
        assertThat(result.message()).contains("yıldız kazandınız");

        // Verify SolvedProblem record created
        verify(solvedProblemRepository).save(any(SolvedProblem.class));

        // Verify user stats updated
        verify(userRepository).save(argThat(user ->
            user.getTotalScore() > 0 &&
            user.getSolvedCount() == 1 &&
            user.getTotalStars() > 0
        ));
    }

    // ==================== VALIDATION TESTS ====================

    @Test
    @DisplayName("Validation: Null problem ID - BadRequestException fırlatmalı")
    void testValidation_NullProblemId_ShouldThrowBadRequestException() {
        // Given
        CheckSolutionRequest request = new CheckSolutionRequest();
        request.setProblemId(null);
        request.setUserId(testUser.getId().toString());
        request.setEntries(Arrays.asList(new CheckSolutionRequest.EntryLine()));

        // When & Then
        assertThatThrownBy(() -> solvedProblemService.checkSolution(request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Problem ID boş olamaz");
    }

    @Test
    @DisplayName("Validation: Geçersiz user ID formatı - BadRequestException fırlatmalı")
    void testValidation_InvalidUserIdFormat_ShouldThrowBadRequestException() {
        // Given
        CheckSolutionRequest request = new CheckSolutionRequest();
        request.setProblemId(1L);
        request.setUserId("invalid-uuid-format");
        request.setEntries(Arrays.asList(new CheckSolutionRequest.EntryLine()));

        when(problemRepository.findById(1L)).thenReturn(Optional.of(testProblem));

        // When & Then
        assertThatThrownBy(() -> solvedProblemService.checkSolution(request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Geçersiz kullanıcı ID formatı");
    }

    @Test
    @DisplayName("Validation: Var olmayan problem - ResourceNotFoundException fırlatmalı")
    void testValidation_NonExistentProblem_ShouldThrowResourceNotFoundException() {
        // Given
        CheckSolutionRequest request = createValidRequest();
        when(problemRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> solvedProblemService.checkSolution(request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Problem bulunamadı");
    }

    // ==================== HELPER METHODS ====================

    private CheckSolutionRequest createValidRequest() {
        CheckSolutionRequest.EntryLine line1 = new CheckSolutionRequest.EntryLine();
        line1.setAccountCode("100");
        line1.setDebit(new BigDecimal("100.00"));
        line1.setCredit(BigDecimal.ZERO);

        CheckSolutionRequest.EntryLine line2 = new CheckSolutionRequest.EntryLine();
        line2.setAccountCode("320");
        line2.setDebit(BigDecimal.ZERO);
        line2.setCredit(new BigDecimal("100.00"));

        CheckSolutionRequest request = new CheckSolutionRequest();
        request.setProblemId(1L);
        request.setUserId(testUser.getId().toString());
        request.setEntries(Arrays.asList(line1, line2));

        return request;
    }
}
