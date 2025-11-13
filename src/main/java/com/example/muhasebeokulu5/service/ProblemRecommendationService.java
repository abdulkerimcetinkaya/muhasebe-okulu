package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.entities.SolvedProblem;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.entities.UserCategoryPerformance;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import com.example.muhasebeokulu5.repository.SolvedProblemRepository;
import com.example.muhasebeokulu5.repository.UserCategoryPerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Adaptive learning service that recommends problems based on user performance.
 *
 * Recommendation Strategy:
 * 1. Analyze recent performance (last 5 problems)
 * 2. Determine appropriate difficulty level (current ±1)
 * 3. Prioritize weak categories (success rate < 60%)
 * 4. Return unsolved problems at recommended level
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProblemRecommendationService {

    private final SolvedProblemRepository solvedProblemRepository;
    private final ProblemRepository problemRepository;
    private final UserCategoryPerformanceRepository categoryPerformanceRepository;

    // Number of recent problems to analyze for adaptive learning
    private static final int RECENT_PROBLEMS_WINDOW = 5;

    // Thresholds for level adjustment
    private static final double EXCELLENT_PERFORMANCE_THRESHOLD = 1.2;  // Average attempts <= 1.2
    private static final double POOR_PERFORMANCE_THRESHOLD = 3.0;       // Average attempts >= 3.0

    /**
     * Get recommended problems for user based on adaptive learning.
     *
     * @param user The user to recommend problems for
     * @param count Number of problems to recommend
     * @return List of recommended problems
     */
    @Transactional(readOnly = true)
    public List<Problem> getRecommendedProblems(User user, int count) {
        // 1. Analyze recent performance
        int recommendedLevel = analyzeRecentPerformanceAndGetLevel(user);

        log.debug("User {} recommended level: {} (current level: {})",
                user.getUsername(), recommendedLevel, user.getCurrentLevel());

        // 2. Get weak categories (if any)
        List<String> weakCategories = getWeakCategories(user);

        // 3. Get recommended problems
        List<Problem> recommendedProblems = new ArrayList<>();

        // Priority 1: Problems from weak categories at recommended level
        if (!weakCategories.isEmpty()) {
            for (String category : weakCategories) {
                List<Problem> categoryProblems = problemRepository
                        .findUnsolvedProblemsByUserAndCategory(user.getId(), category)
                        .stream()
                        .filter(p -> p.getLevel() != null && p.getLevel().equals(recommendedLevel))
                        .limit(count / 2)  // Half from weak categories
                        .collect(Collectors.toList());

                recommendedProblems.addAll(categoryProblems);

                if (recommendedProblems.size() >= count) {
                    break;
                }
            }

            log.debug("Added {} problems from weak categories for user {}",
                    recommendedProblems.size(), user.getUsername());
        }

        // Priority 2: General unsolved problems at recommended level
        if (recommendedProblems.size() < count) {
            List<Problem> generalProblems = problemRepository
                    .findUnsolvedProblemsByUserAndLevel(user.getId(), recommendedLevel)
                    .stream()
                    .filter(p -> !recommendedProblems.contains(p))  // Avoid duplicates
                    .limit(count - recommendedProblems.size())
                    .collect(Collectors.toList());

            recommendedProblems.addAll(generalProblems);

            log.debug("Added {} general problems at level {} for user {}",
                    generalProblems.size(), recommendedLevel, user.getUsername());
        }

        // Shuffle to avoid predictable patterns
        Collections.shuffle(recommendedProblems);

        log.info("Recommended {} problems for user {} (level {}, weak categories: {})",
                recommendedProblems.size(), user.getUsername(), recommendedLevel, weakCategories.size());

        return recommendedProblems.stream().limit(count).collect(Collectors.toList());
    }

    /**
     * Analyze user's recent performance and determine recommended level.
     *
     * Strategy:
     * - Excellent performance (avg attempts <= 1.2) → Level + 1
     * - Poor performance (avg attempts >= 3.0) → Level - 1
     * - Otherwise → Current level
     *
     * @param user The user
     * @return Recommended difficulty level (1-10)
     */
    @Transactional(readOnly = true)
    public int analyzeRecentPerformanceAndGetLevel(User user) {
        // Get last N solved problems
        List<SolvedProblem> recentProblems = solvedProblemRepository
                .findLastNByUser(user, PageRequest.of(0, RECENT_PROBLEMS_WINDOW));

        if (recentProblems.isEmpty()) {
            // No recent problems, stick to current level
            return user.getCurrentLevel();
        }

        // Calculate average attempts
        double averageAttempts = recentProblems.stream()
                .mapToInt(SolvedProblem::getAttemptCount)
                .average()
                .orElse(0.0);

        int currentLevel = user.getCurrentLevel();
        int recommendedLevel = currentLevel;

        // Check if user is consistently excellent (all first attempt)
        boolean allFirstAttempt = recentProblems.stream()
                .allMatch(sp -> sp.getAttemptCount() == 1);

        if (allFirstAttempt && recentProblems.size() >= RECENT_PROBLEMS_WINDOW) {
            // Perfect performance on all recent problems → Challenge with higher level
            recommendedLevel = Math.min(10, currentLevel + 1);
            log.debug("User {} has perfect recent performance, recommending level {}",
                    user.getUsername(), recommendedLevel);
        } else if (averageAttempts <= EXCELLENT_PERFORMANCE_THRESHOLD) {
            // Excellent performance → Suggest one level up
            recommendedLevel = Math.min(10, currentLevel + 1);
            log.debug("User {} has excellent performance (avg attempts: {}), recommending level {}",
                    user.getUsername(), averageAttempts, recommendedLevel);
        } else if (averageAttempts >= POOR_PERFORMANCE_THRESHOLD) {
            // Struggling → Suggest one level down
            recommendedLevel = Math.max(1, currentLevel - 1);
            log.debug("User {} is struggling (avg attempts: {}), recommending level {}",
                    user.getUsername(), averageAttempts, recommendedLevel);
        } else {
            // Average performance → Stay at current level
            log.debug("User {} has average performance (avg attempts: {}), staying at level {}",
                    user.getUsername(), averageAttempts, currentLevel);
        }

        return recommendedLevel;
    }

    /**
     * Get categories where user is weak (success rate < 60%).
     *
     * @param user The user
     * @return List of weak category names
     */
    @Transactional(readOnly = true)
    public List<String> getWeakCategories(User user) {
        List<UserCategoryPerformance> weakAreas = categoryPerformanceRepository
                .findWeakAreasByUser(user);

        return weakAreas.stream()
                .map(UserCategoryPerformance::getCategory)
                .collect(Collectors.toList());
    }

    /**
     * Get categories where user is strong (success rate > 80% AND avg attempts < 1.8).
     *
     * @param user The user
     * @return List of strong category names
     */
    @Transactional(readOnly = true)
    public List<String> getStrongCategories(User user) {
        List<UserCategoryPerformance> strongAreas = categoryPerformanceRepository
                .findStrongAreasByUser(user);

        return strongAreas.stream()
                .map(UserCategoryPerformance::getCategory)
                .collect(Collectors.toList());
    }

    /**
     * Get all unsolved problems at user's current level.
     *
     * @param user The user
     * @return List of unsolved problems
     */
    @Transactional(readOnly = true)
    public List<Problem> getUnsolvedProblemsAtCurrentLevel(User user) {
        return problemRepository.findUnsolvedProblemsByUserAndLevel(
                user.getId(),
                user.getCurrentLevel()
        );
    }

    /**
     * Get recommendation statistics for user.
     *
     * @param user The user
     * @return Map with recommendation statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRecommendationStatistics(User user) {
        Map<String, Object> stats = new HashMap<>();

        // Analyze recent performance
        List<SolvedProblem> recentProblems = solvedProblemRepository
                .findLastNByUser(user, PageRequest.of(0, RECENT_PROBLEMS_WINDOW));

        int recommendedLevel = analyzeRecentPerformanceAndGetLevel(user);
        List<String> weakCategories = getWeakCategories(user);
        List<String> strongCategories = getStrongCategories(user);

        stats.put("currentLevel", user.getCurrentLevel());
        stats.put("recommendedLevel", recommendedLevel);
        stats.put("recentProblemsAnalyzed", recentProblems.size());

        if (!recentProblems.isEmpty()) {
            double avgAttempts = recentProblems.stream()
                    .mapToInt(SolvedProblem::getAttemptCount)
                    .average()
                    .orElse(0.0);
            stats.put("recentAverageAttempts", String.format("%.2f", avgAttempts));
        }

        stats.put("weakCategories", weakCategories);
        stats.put("strongCategories", strongCategories);
        stats.put("unsolvedAtCurrentLevel",
                problemRepository.findUnsolvedProblemsByUserAndLevel(user.getId(), user.getCurrentLevel()).size());
        stats.put("unsolvedAtRecommendedLevel",
                problemRepository.findUnsolvedProblemsByUserAndLevel(user.getId(), recommendedLevel).size());

        return stats;
    }

    /**
     * Get problems specifically from weak categories for practice.
     *
     * @param user The user
     * @param count Number of problems to return
     * @return List of problems from weak categories
     */
    @Transactional(readOnly = true)
    public List<Problem> getPracticeProblemsForWeakCategories(User user, int count) {
        List<String> weakCategories = getWeakCategories(user);

        if (weakCategories.isEmpty()) {
            log.debug("User {} has no weak categories", user.getUsername());
            return Collections.emptyList();
        }

        List<Problem> practiceProblems = new ArrayList<>();

        for (String category : weakCategories) {
            List<Problem> categoryProblems = problemRepository
                    .findUnsolvedProblemsByUserAndCategory(user.getId(), category)
                    .stream()
                    .limit(count)
                    .collect(Collectors.toList());

            practiceProblems.addAll(categoryProblems);

            if (practiceProblems.size() >= count) {
                break;
            }
        }

        Collections.shuffle(practiceProblems);

        return practiceProblems.stream().limit(count).collect(Collectors.toList());
    }
}
