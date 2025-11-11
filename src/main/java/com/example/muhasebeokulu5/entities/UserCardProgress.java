package com.example.muhasebeokulu5.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UserCardProgress entity - Tracks user progress on study card sections
 * Records which sections a user has completed for each study card
 */
@Entity
@Table(name = "user_card_progress", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "card_section_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCardProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_card_id", nullable = false)
    private StudyCard studyCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_section_id", nullable = false)
    private CardSection cardSection;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(nullable = true)
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
