package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import com.example.muhasebeokulu5.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for initial placement testing to determine user's starting level.
 *
 * Placement Test Strategy:
 * - Selects 7 problems from different levels (2, 5, 8)
 * - Based on score, assigns appropriate starting level
 * - User can skip test and start at level 1
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlacementTestService {

    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    // Total questions in placement test
    private static final int TOTAL_TEST_QUESTIONS = 7;

    // Distribution: 2 from beginner, 3 from intermediate, 2 from advanced
    private static final Map<Integer, Integer> LEVEL_DISTRIBUTION = new HashMap<>() {{
        put(2, 2);  // 2 questions from level 2 (beginner)
        put(5, 3);  // 3 questions from level 5 (intermediate)
        put(8, 2);  // 2 questions from level 8 (advanced)
    }};

    /**
     * Get problems for placement test.
     * Selects a mix of problems from different levels.
     *
     * @return List of 7 problems for placement test
     */
    @Transactional(readOnly = true)
    public List<Problem> getPlacementTestProblems() {
        List<Problem> testProblems = new ArrayList<>();

        for (Map.Entry<Integer, Integer> entry : LEVEL_DISTRIBUTION.entrySet()) {
            Integer level = entry.getKey();
            Integer count = entry.getValue();

            // Get random problems from this level
            List<Problem> problemsAtLevel = problemRepository.findByLevel(level);

            if (problemsAtLevel.isEmpty()) {
                log.warn("No problems found for level {}. Placement test may be incomplete.", level);
                continue;
            }

            // Randomly select required number of problems
            Collections.shuffle(problemsAtLevel);
            testProblems.addAll(problemsAtLevel.stream()
                    .limit(count)
                    .collect(Collectors.toList()));
        }

        // Shuffle final list so levels are mixed
        Collections.shuffle(testProblems);

        log.info("Generated placement test with {} problems", testProblems.size());
        return testProblems;
    }

    /**
     * Calculate starting level based on placement test score.
     *
     * Scoring logic:
     * - 6-7 correct → Start at level 7 (advanced)
     * - 4-5 correct → Start at level 4 (intermediate)
     * - 2-3 correct → Start at level 2 (beginner)
     * - 0-1 correct → Start at level 1 (absolute beginner)
     *
     * @param correctAnswers Number of correct answers (0-7)
     * @return Recommended starting level (1-7)
     */
    public int calculateStartingLevel(int correctAnswers) {
        if (correctAnswers < 0 || correctAnswers > TOTAL_TEST_QUESTIONS) {
            log.error("Invalid score: {}. Must be 0-{}", correctAnswers, TOTAL_TEST_QUESTIONS);
            return 1; // Default to level 1
        }

        if (correctAnswers >= 6) {
            return 7;  // Advanced
        } else if (correctAnswers >= 4) {
            return 4;  // Intermediate
        } else if (correctAnswers >= 2) {
            return 2;  // Beginner
        } else {
            return 1;  // Absolute beginner
        }
    }

    /**
     * Complete placement test for user.
     * Updates user's level and marks test as completed.
     *
     * @param user The user completing the test
     * @param score Number of correct answers (0-7)
     * @return Updated user entity
     */
    @Transactional
    public User completePlacementTest(User user, int score) {
        if (user.getPlacementTestCompleted()) {
            log.warn("User {} has already completed placement test", user.getUsername());
            return user;
        }

        int startingLevel = calculateStartingLevel(score);

        user.setPlacementTestCompleted(true);
        user.setPlacementTestScore(score);
        user.setPlacementTestDate(LocalDateTime.now());
        user.setCurrentLevel(startingLevel);
        user.setLevelPoints(0); // Start fresh at assigned level

        User savedUser = userRepository.save(user);

        log.info("User {} completed placement test: score={}/{}, assigned level={}",
                user.getUsername(), score, TOTAL_TEST_QUESTIONS, startingLevel);

        return savedUser;
    }

    /**
     * Allow user to skip placement test and start at level 1.
     *
     * @param user The user skipping the test
     * @return Updated user entity
     */
    @Transactional
    public User skipPlacementTest(User user) {
        if (user.getPlacementTestCompleted()) {
            log.warn("User {} has already completed/skipped placement test", user.getUsername());
            return user;
        }

        user.setPlacementTestCompleted(true);
        user.setPlacementTestScore(null);  // null indicates test was skipped
        user.setPlacementTestDate(LocalDateTime.now());
        user.setCurrentLevel(1);  // Start at level 1
        user.setLevelPoints(0);

        User savedUser = userRepository.save(user);

        log.info("User {} skipped placement test, starting at level 1", user.getUsername());

        return savedUser;
    }

    /**
     * Check if placement test is available (enough problems at required levels).
     *
     * @return true if test can be generated
     */
    @Transactional(readOnly = true)
    public boolean isPlacementTestAvailable() {
        for (Map.Entry<Integer, Integer> entry : LEVEL_DISTRIBUTION.entrySet()) {
            Integer level = entry.getKey();
            Integer requiredCount = entry.getValue();

            long availableCount = problemRepository.countByLevel(level);

            if (availableCount < requiredCount) {
                log.warn("Insufficient problems for placement test at level {}. Need {}, have {}",
                        level, requiredCount, availableCount);
                return false;
            }
        }

        return true;
    }

    /**
     * Get placement test status for user.
     *
     * @param user The user
     * @return Map with test status information
     */
    public Map<String, Object> getPlacementTestStatus(User user) {
        Map<String, Object> status = new HashMap<>();

        status.put("completed", user.getPlacementTestCompleted());
        status.put("score", user.getPlacementTestScore());
        status.put("testDate", user.getPlacementTestDate());
        status.put("currentLevel", user.getCurrentLevel());
        status.put("testAvailable", isPlacementTestAvailable());
        status.put("totalQuestions", TOTAL_TEST_QUESTIONS);

        if (user.getPlacementTestScore() == null && user.getPlacementTestCompleted()) {
            status.put("skipped", true);
        } else {
            status.put("skipped", false);
        }

        return status;
    }
}
