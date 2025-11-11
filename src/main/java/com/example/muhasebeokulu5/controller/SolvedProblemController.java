package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.CheckSolutionRequest;
import com.example.muhasebeokulu5.dto.SolvedProblemSummaryDTO;
import com.example.muhasebeokulu5.dto.UserEntryDTO;
import com.example.muhasebeokulu5.service.SolvedProblemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/solved-problems")
public class SolvedProblemController {

    private final SolvedProblemService solvedProblemService;

    public SolvedProblemController(SolvedProblemService solvedProblemService) {
        this.solvedProblemService = solvedProblemService;
    }

    // ✅ DTO döndür (entity değil)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SolvedProblemSummaryDTO>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(solvedProblemService.getSolvedProblemsByUserId(userId));
    }

    // ✅ GÜNCELLENDİ - CheckSolutionRequest kullanıyor
    @PostMapping("/check")
    public ResponseEntity<?> checkSolution(@Valid @RequestBody CheckSolutionRequest request) {
        try {
            System.out.println("🎯 /check endpoint HIT!");
            System.out.println("Problem ID: " + request.getProblemId());
            System.out.println("User ID: " + request.getUserId());
            System.out.println("Entries: " + request.getEntries().size());
            
            // Service'e gönder
            var result = solvedProblemService.checkSolution(request);
            
            return ResponseEntity.ok(Map.of(
                "balanced", result.balanced(),
                "correct", result.correct(),
                "message", result.message()
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "Test endpoint çalışıyor!"));
    }

    /**
     * Öğrencinin bu problemi daha önce gönderip göndermediğini kontrol et
     * GET /api/solved-problems/check-submission?problemId=X&userId=Y
     */
    @GetMapping("/check-submission")
    public ResponseEntity<?> checkSubmission(
            @RequestParam Long problemId,
            @RequestParam UUID userId
    ) {
        boolean alreadySubmitted = solvedProblemService.hasUserSubmitted(userId, problemId);
        return ResponseEntity.ok(Map.of("alreadySubmitted", alreadySubmitted));
    }

    /**
     * Kullanıcının istatistiklerini döndürür
     * GET /api/solved-problems/stats/{userId}
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable UUID userId) {
        try {
            var stats = solvedProblemService.getUserStatistics(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                Map.of("error", e.getMessage())
            );
        }
    }
}