package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.repository.UserRepository;
import com.example.muhasebeokulu5.service.LevelService;
import com.example.muhasebeokulu5.service.PlacementTestService;
import com.example.muhasebeokulu5.service.ProblemRecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST API for level system management.
 *
 * Endpoints:
 * - Level progression and statistics
 * - Placement test operations
 * - Problem recommendations (adaptive learning)
 */
@RestController
@RequestMapping("/api/levels")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:63342", "http://localhost:8080", "http://192.168.1.36:63342", "http://127.0.0.1:63342"}, allowCredentials = "true")
public class LevelController {

    private final LevelService levelService;
    private final PlacementTestService placementTestService;
    private final ProblemRecommendationService recommendationService;
    private final UserRepository userRepository;

    // ============================================
    // LEVEL STATISTICS & PROGRESSION
    // ============================================

    /**
     * Get current user's level statistics.
     * GET /api/levels/my-stats
     */
    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Object>> getMyLevelStatistics(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> stats = levelService.getLevelStatistics(user);

        return ResponseEntity.ok(stats);
    }

    /**
     * Get level progress percentage for current user.
     * GET /api/levels/my-progress
     */
    @GetMapping("/my-progress")
    public ResponseEntity<Map<String, Object>> getMyProgress(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double progress = levelService.getLevelProgressPercentage(user);

        Map<String, Object> response = new HashMap<>();
        response.put("currentLevel", user.getCurrentLevel());
        response.put("levelPoints", user.getLevelPoints());
        response.put("progressPercentage", progress);

        return ResponseEntity.ok(response);
    }

    /**
     * Manually check if eligible for level up (for testing/debugging).
     * GET /api/levels/check-levelup
     */
    @GetMapping("/check-levelup")
    public ResponseEntity<Map<String, Object>> checkLevelUpEligibility(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean eligible = levelService.isEligibleForLevelUp(user);

        Map<String, Object> response = new HashMap<>();
        response.put("eligible", eligible);
        response.put("currentLevel", user.getCurrentLevel());
        response.put("levelPoints", user.getLevelPoints());

        if (eligible) {
            response.put("message", "Congratulations! You are eligible to advance to level " + (user.getCurrentLevel() + 1));
        }

        return ResponseEntity.ok(response);
    }

    // ============================================
    // PLACEMENT TEST
    // ============================================

    /**
     * Get placement test status for current user.
     * GET /api/levels/placement-test/status
     */
    @GetMapping("/placement-test/status")
    public ResponseEntity<Map<String, Object>> getPlacementTestStatus(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> status = placementTestService.getPlacementTestStatus(user);

        return ResponseEntity.ok(status);
    }

    /**
     * Get placement test problems.
     * GET /api/levels/placement-test/problems
     */
    @GetMapping("/placement-test/problems")
    public ResponseEntity<List<Problem>> getPlacementTestProblems(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPlacementTestCompleted()) {
            return ResponseEntity.badRequest().build();  // Already completed
        }

        List<Problem> testProblems = placementTestService.getPlacementTestProblems();

        return ResponseEntity.ok(testProblems);
    }

    /**
     * Submit placement test results.
     * POST /api/levels/placement-test/submit
     * Body: { "score": 5 }  (0-7)
     */
    @PostMapping("/placement-test/submit")
    public ResponseEntity<Map<String, Object>> submitPlacementTest(
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPlacementTestCompleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Placement test already completed"));
        }

        Integer score = request.get("score");
        if (score == null || score < 0 || score > 7) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid score. Must be 0-7"));
        }

        User updatedUser = placementTestService.completePlacementTest(user, score);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("score", score);
        response.put("assignedLevel", updatedUser.getCurrentLevel());
        response.put("message", "Placement test completed! Starting at level " + updatedUser.getCurrentLevel());

        log.info("User {} completed placement test: score={}, level={}",
                username, score, updatedUser.getCurrentLevel());

        return ResponseEntity.ok(response);
    }

    /**
     * Skip placement test and start at level 1.
     * POST /api/levels/placement-test/skip
     */
    @PostMapping("/placement-test/skip")
    public ResponseEntity<Map<String, Object>> skipPlacementTest(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPlacementTestCompleted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Placement test already completed/skipped"));
        }

        User updatedUser = placementTestService.skipPlacementTest(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Placement test skipped. Starting at level 1");
        response.put("currentLevel", updatedUser.getCurrentLevel());

        log.info("User {} skipped placement test", username);

        return ResponseEntity.ok(response);
    }

    // ============================================
    // PROBLEM RECOMMENDATIONS (Adaptive Learning)
    // ============================================

    /**
     * Get recommended problems for current user.
     * GET /api/levels/recommendations?count=10
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<Problem>> getRecommendedProblems(
            @RequestParam(defaultValue = "10") int count,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Problem> recommended = recommendationService.getRecommendedProblems(user, count);

        return ResponseEntity.ok(recommended);
    }

    /**
     * Get recommendation statistics for current user.
     * GET /api/levels/recommendations/stats
     */
    @GetMapping("/recommendations/stats")
    public ResponseEntity<Map<String, Object>> getRecommendationStats(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> stats = recommendationService.getRecommendationStatistics(user);

        return ResponseEntity.ok(stats);
    }

    /**
     * Get practice problems for weak categories.
     * GET /api/levels/practice-weak?count=10
     */
    @GetMapping("/practice-weak")
    public ResponseEntity<List<Problem>> getPracticeProblemsForWeakCategories(
            @RequestParam(defaultValue = "10") int count,
            Authentication authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Problem> practiceProblems = recommendationService.getPracticeProblemsForWeakCategories(user, count);

        return ResponseEntity.ok(practiceProblems);
    }

    /**
     * Get unsolved problems at current level.
     * GET /api/levels/unsolved-at-my-level
     */
    @GetMapping("/unsolved-at-my-level")
    public ResponseEntity<List<Problem>> getUnsolvedAtMyLevel(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Problem> unsolved = recommendationService.getUnsolvedProblemsAtCurrentLevel(user);

        return ResponseEntity.ok(unsolved);
    }
}
