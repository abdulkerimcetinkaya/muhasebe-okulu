package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "problems")
@Data
@ToString(exclude = {"correctEntries", "userAnswers", "solvedProblems", "discussionPosts"})
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String hint;
    private String tags;

    // ✅ YENİ: Zorluk seviyesi
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty = Difficulty.MEDIUM;

    // ============================================
    // 🎯 LEVEL SYSTEM (Seviye Sistemi)
    // ============================================
    @Column(name = "level")
    private Integer level;  // Problem level (1-10), set by admin

    @Column(name = "category", length = 100)
    private String category;  // Problem category (e.g., "Kasa İşlemleri", "Banka İşlemleri")
    // Admin can create custom categories freely

    // ✅ YENİ: Öğretmen tarafından oluşturulan özel problemler
    @Column(name = "created_by")
    private UUID createdBy; // Öğretmen/Admin ID (nullable - eski problemler için)

    // Room-specific isPrivate field has been archived

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<CorrectEntry> correctEntries;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<UserAnswer> userAnswers;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SolvedProblem> solvedProblems;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DiscussionPost> discussionPosts;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}