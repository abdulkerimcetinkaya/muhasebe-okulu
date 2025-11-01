package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * CardSection entity - Subsections within a StudyCard
 * Contains dynamic content that can be text, problem reference, or quiz reference
 */
@Entity
@Table(name = "card_sections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_card_id", nullable = false)
    @JsonIgnore
    private StudyCard studyCard;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    /**
     * Content type determines how to display this section:
     * - TEXT: Display content field as rich text
     * - PROBLEM: Link to a Problem entity (use relatedProblemId)
     * - QUIZ: Link to a Quiz entity (use relatedQuizId)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentType contentType = ContentType.TEXT;

    @Column(columnDefinition = "TEXT")
    private String content; // Used when contentType = TEXT

    @Column(name = "related_problem_id")
    private Long relatedProblemId; // Foreign key to Problem - used when contentType = PROBLEM

    @Column(name = "related_quiz_id")
    private Long relatedQuizId; // Foreign key to Quiz - used when contentType = QUIZ

    @Column(nullable = false)
    @JsonProperty("active")
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Content type enum for CardSection
     */
    public enum ContentType {
        TEXT,    // Plain text/HTML content
        PROBLEM, // Link to Problem entity
        QUIZ     // Link to Quiz entity
    }
}
