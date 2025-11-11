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
 * Now supports MIXED CONTENT through ContentItem list
 * Each section can contain multiple content items (text, problems, quizzes) in any order
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
     * Rich text content with slash command support
     * Stores HTML content generated from rich text editor
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * Content items - ordered list of mixed content (DEPRECATED - use content field instead)
     * Each item can be: TEXT, PROBLEM link, QUIZ link, STUDY_PROBLEM, or STUDY_QUIZ
     */
    @OneToMany(mappedBy = "cardSection", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @JsonIgnore
    private java.util.List<ContentItem> contentItems = new java.util.ArrayList<>();

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
}
