package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.entities.SolvedProblem;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.repository.SolvedProblemRepository;
import com.example.muhasebeokulu5.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for managing user level progression in the 10-level system.
 *
 * Level System Design:
 * - Users progress through levels 1-10 based on performance
 * - Higher levels require more problems solved with better performance
 * - Points are earned per problem based on attempt count
 * - Overflow points carry over to next level
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LevelService {

    private final UserRepository userRepository;
    private final SolvedProblemRepository solvedProblemRepository;

    // ============================================
    // LEVEL REQUIREMENTS CONFIGURATION
    // ============================================

    /**
     * Progressive difficulty: higher levels require more problems.
     * Formula: 10 + (level * 3)
     */
    private static final Map<Integer, Integer> REQUIRED_PROBLEMS_PER_LEVEL = new HashMap<>() {{
        put(1, 10);  // Level 1→2: 10 problems
        put(2, 13);  // Level 2→3: 13 problems
        put(3, 16);  // Level 3→4: 16 problems
        put(4, 19);  // Level 4→5: 19 problems
        put(5, 22);  // Level 5→6: 22 problems
        put(6, 25);  // Level 6→7: 25 problems
        put(7, 28);  // Level 7→8: 28 problems
        put(8, 31);  // Level 8→9: 31 problems
        put(9, 34);  // Level 9→10: 34 problems
    }};

    /**
     * Progressive point requirements: higher levels need more points.
     * Formula: 80 + (level * 40)
     */
    private static final Map<Integer, Integer> REQUIRED_POINTS_PER_LEVEL = new HashMap<>() {{
        put(1, 120);   // Level 1→2: 120 points
        put(2, 160);   // Level 2→3: 160 points
        put(3, 200);   // Level 3→4: 200 points
        put(4, 240);   // Level 4→5: 240 points
        put(5, 280);   // Level 5→6: 280 points
        put(6, 320);   // Level 6→7: 320 points
        put(7, 360);   // Level 7→8: 360 points
        put(8, 400);   // Level 8→9: 400 points
        put(9, 450);   // Level 9→10: 450 points
    }};

    /**
     * Maximum allowed average attempts per level.
     * Lower is better - indicates user is solving with fewer mistakes.
     */
    private static final Map<Integer, Double> MAX_AVERAGE_ATTEMPTS_PER_LEVEL = new HashMap<>() {{
        put(1, 2.5);   // Beginner: allow more mistakes
        put(2, 2.5);
        put(3, 2.5);
        put(4, 2.5);
        put(5, 2.5);
        put(6, 2.0);   // Intermediate: stricter requirements
        put(7, 2.0);
        put(8, 2.0);
        put(9, 1.5);   // Expert: must be very accurate
    }};

    // ============================================
    // POINT CALCULATION
    // ============================================

    /**
     * Calculate points earned for solving a problem.
     * First attempt earns more points, encouraging accuracy.
     *
     * @param attemptCount Number of attempts (1 = first try)
     * @return Points earned (15 for first attempt, 10 for second, 5 for third+)
     */
    public int calculatePointsForAttempt(int attemptCount) {
        if (attemptCount == 1) {
            return 15;  // Excellent! First try
        } else if (attemptCount == 2) {
            return 10;  // Good! Second try
        } else {
            return 5;   // Acceptable, but struggled
        }
    }

    // ============================================
    // LEVEL PROGRESSION
    // ============================================

    /**
     * Check if user is eligible to advance to next level.
     * Must meet ALL three criteria:
     * 1. Solved required number of problems at current level
     * 2. Accumulated required points
     * 3. Average attempts is below threshold
     *
     * @param user The user to check
     * @return true if eligible for level up
     */
    @Transactional(readOnly = true)
    public boolean isEligibleForLevelUp(User user) {
        int currentLevel = user.getCurrentLevel();

        // Already at max level
        if (currentLevel >= 10) {
            return false;
        }

        // Get requirements for current level
        Integer requiredProblems = REQUIRED_PROBLEMS_PER_LEVEL.get(currentLevel);
        Integer requiredPoints = REQUIRED_POINTS_PER_LEVEL.get(currentLevel);
        Double maxAverageAttempts = MAX_AVERAGE_ATTEMPTS_PER_LEVEL.get(currentLevel);

        if (requiredProblems == null || requiredPoints == null || maxAverageAttempts == null) {
            log.warn("Level configuration missing for level {}", currentLevel);
            return false;
        }

        // Count problems solved at current level
        List<SolvedProblem> solvedAtCurrentLevel = solvedProblemRepository
                .findByUserAndProblem_Level(user, currentLevel);

        int problemCount = solvedAtCurrentLevel.size();

        // Check if solved enough problems
        if (problemCount < requiredProblems) {
            log.debug("User {} needs {} more problems at level {} (current: {})",
                    user.getUsername(), requiredProblems - problemCount, currentLevel, problemCount);
            return false;
        }

        // Check if accumulated enough points
        if (user.getLevelPoints() < requiredPoints) {
            log.debug("User {} needs {} more points at level {} (current: {})",
                    user.getUsername(), requiredPoints - user.getLevelPoints(), currentLevel, user.getLevelPoints());
            return false;
        }

        // Calculate average attempts
        double averageAttempts = solvedAtCurrentLevel.stream()
                .mapToInt(SolvedProblem::getAttemptCount)
                .average()
                .orElse(0.0);

        // Check if average attempts is acceptable
        if (averageAttempts > maxAverageAttempts) {
            log.debug("User {} average attempts too high at level {} ({} > {})",
                    user.getUsername(), currentLevel, averageAttempts, maxAverageAttempts);
            return false;
        }

        log.info("User {} is eligible for level up! Level {} → {}",
                user.getUsername(), currentLevel, currentLevel + 1);
        return true;
    }

    /**
     * Advance user to next level.
     * Carries over excess points to new level.
     *
     * @param user The user to level up
     * @return Updated user entity
     */
    @Transactional
    public User levelUp(User user) {
        int currentLevel = user.getCurrentLevel();

        if (currentLevel >= 10) {
            log.warn("User {} already at max level", user.getUsername());
            return user;
        }

        if (!isEligibleForLevelUp(user)) {
            log.warn("User {} not eligible for level up", user.getUsername());
            return user;
        }

        // Calculate overflow points
        Integer requiredPoints = REQUIRED_POINTS_PER_LEVEL.get(currentLevel);
        int overflowPoints = user.getLevelPoints() - requiredPoints;

        // Level up
        user.setCurrentLevel(currentLevel + 1);
        user.setLevelPoints(Math.max(0, overflowPoints)); // Carry over excess points

        User savedUser = userRepository.save(user);

        log.info("User {} leveled up! {} → {} (overflow points: {})",
                user.getUsername(), currentLevel, currentLevel + 1, overflowPoints);

        return savedUser;
    }

    /**
     * Award points to user and check for automatic level up.
     *
     * @param user The user who solved the problem
     * @param attemptCount Number of attempts for this problem
     * @return Updated user (may have leveled up)
     */
    @Transactional
    public User awardPointsAndCheckLevelUp(User user, int attemptCount) {
        int pointsEarned = calculatePointsForAttempt(attemptCount);

        // Add points to user's current level progress
        user.setLevelPoints(user.getLevelPoints() + pointsEarned);
        User savedUser = userRepository.save(user);

        log.debug("User {} earned {} points (attempts: {}), total: {}",
                user.getUsername(), pointsEarned, attemptCount, savedUser.getLevelPoints());

        // Check if eligible for level up
        if (isEligibleForLevelUp(savedUser)) {
            savedUser = levelUp(savedUser);
        }

        return savedUser;
    }

    /**
     * Get progress percentage for current level.
     *
     * @param user The user
     * @return Progress percentage (0-100)
     */
    public double getLevelProgressPercentage(User user) {
        int currentLevel = user.getCurrentLevel();

        if (currentLevel >= 10) {
            return 100.0; // Max level reached
        }

        Integer requiredPoints = REQUIRED_POINTS_PER_LEVEL.get(currentLevel);
        if (requiredPoints == null) {
            return 0.0;
        }

        return Math.min(100.0, (user.getLevelPoints() * 100.0) / requiredPoints);
    }

    /**
     * Get detailed level statistics for user.
     *
     * @param user The user
     * @return Map with level statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getLevelStatistics(User user) {
        int currentLevel = user.getCurrentLevel();

        Map<String, Object> stats = new HashMap<>();
        stats.put("currentLevel", currentLevel);
        stats.put("levelPoints", user.getLevelPoints());
        stats.put("progressPercentage", getLevelProgressPercentage(user));

        if (currentLevel < 10) {
            Integer requiredProblems = REQUIRED_PROBLEMS_PER_LEVEL.get(currentLevel);
            Integer requiredPoints = REQUIRED_POINTS_PER_LEVEL.get(currentLevel);
            Double maxAverageAttempts = MAX_AVERAGE_ATTEMPTS_PER_LEVEL.get(currentLevel);

            List<SolvedProblem> solvedAtCurrentLevel = solvedProblemRepository
                    .findByUserAndProblem_Level(user, currentLevel);

            int problemCount = solvedAtCurrentLevel.size();
            double averageAttempts = solvedAtCurrentLevel.stream()
                    .mapToInt(SolvedProblem::getAttemptCount)
                    .average()
                    .orElse(0.0);

            stats.put("problemsSolved", problemCount);
            stats.put("problemsRequired", requiredProblems);
            stats.put("pointsRequired", requiredPoints);
            stats.put("averageAttempts", String.format("%.2f", averageAttempts));
            stats.put("maxAverageAttempts", maxAverageAttempts);
            stats.put("canLevelUp", isEligibleForLevelUp(user));
        } else {
            stats.put("maxLevelReached", true);
        }

        return stats;
    }
}
