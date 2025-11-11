package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * ContentItem entity - Individual content pieces within a CardSection
 * Allows mixed content: text, problems, and quizzes in any order
 * This is the key to flexible, multi-content sections
 */
@Entity
@Table(name = "content_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_section_id", nullable = false)
    @JsonIgnore
    private CardSection cardSection;

    /**
     * Content type determines what kind of content this item holds
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContentType contentType;

    @Column(nullable = false)
    private Integer displayOrder = 0; // Order within the section

    // ========== TEXT Content ==========
    @Column(columnDefinition = "TEXT")
    private String textContent; // HTML content for TEXT type

    // ========== BLOCK DATA (for Notion-like structured content) ==========
    /**
     * JSON data for structured blocks (headings, lists, tables, callouts, etc.)
     * This field stores the complete block structure from the Notion-like editor
     */
    @Column(columnDefinition = "TEXT")
    private String blockData;

    // ========== STUDY_PROBLEM Content ==========
    @OneToOne(mappedBy = "contentItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private StudyProblem studyProblem; // Used when contentType = STUDY_PROBLEM

    // ========== STUDY_QUIZ Content ==========
    @OneToOne(mappedBy = "contentItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private StudyQuiz studyQuiz; // Used when contentType = STUDY_QUIZ

    // ========== EXTERNAL References ==========
    @Column(name = "related_problem_id")
    private Long relatedProblemId; // Foreign key to Problem - used when contentType = PROBLEM

    @Column(name = "related_quiz_id")
    private Long relatedQuizId; // Foreign key to Quiz - used when contentType = QUIZ

    @Column(nullable = false)
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
     * Content type enum for ContentItem
     */
    public enum ContentType {
        TEXT,           // HTML text content
        PROBLEM,        // Link to existing Problem entity
        QUIZ,           // Link to existing Quiz entity
        STUDY_PROBLEM,  // Custom problem specific to this section
        STUDY_QUIZ,     // Custom quiz specific to this section

        // ========== NOTION-LIKE BLOCK TYPES ==========
        PARAGRAPH,      // Text paragraph block
        HEADING,        // Heading block (H1, H2, H3)
        LIST,           // List block (bullet or numbered)
        TABLE,          // Table block
        DIVIDER,        // Divider line block
        CODE,           // Code block
        QUOTE,          // Quote block
        CALLOUT       // Callout/alert box block
    }
}
