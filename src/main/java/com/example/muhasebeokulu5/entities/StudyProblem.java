package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * StudyProblem entity - Custom accounting problems specific to Study Cards
 * These are different from regular Problem entities - they exist only within Study Cards
 */
@Entity
@Table(name = "study_problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_item_id", nullable = false)
    @JsonIgnore
    private ContentItem contentItem;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // HTML content describing the problem

    @Column(columnDefinition = "TEXT")
    private String hint; // Optional hint for students

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty = Difficulty.ORTA;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "studyProblem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudyProblemEntry> correctEntries = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Difficulty levels for study problems
     */
    public enum Difficulty {
        KOLAY,   // Easy
        ORTA,    // Medium
        ZOR      // Hard
    }
}
