package com.example.muhasebeokulu5.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "solved_problems")
@Data
public class SolvedProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    @Column(nullable = false)
    private boolean balanced;

    @Column(nullable = false)
    private boolean isCorrect;

    // ✅ DEĞİŞTİRİLDİ: "score" → "earnedPoints" (daha açıklayıcı)
    @Column(nullable = false)
    private int earnedPoints;

    // ============================================
    // 🎯 LEVEL SYSTEM (Seviye Sistemi)
    // ============================================
    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 1;  // Number of attempts before solving correctly (min: 1)
    // Used for adaptive learning: fewer attempts = better performance

    @Column(nullable = false)
    private LocalDateTime solvedAt = LocalDateTime.now();
}