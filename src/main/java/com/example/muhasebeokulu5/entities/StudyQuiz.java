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
 * StudyQuiz entity - Custom quizzes specific to Study Cards
 * These are different from regular Quiz entities - they exist only within Study Cards
 */
@Entity
@Table(name = "study_quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_item_id", nullable = false)
    @JsonIgnore
    private ContentItem contentItem;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes; // Optional time limit in minutes

    @Column(nullable = false)
    private Integer passPercentage = 70; // Pass percentage (default 70%)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "studyQuiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<StudyQuestion> questions = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
