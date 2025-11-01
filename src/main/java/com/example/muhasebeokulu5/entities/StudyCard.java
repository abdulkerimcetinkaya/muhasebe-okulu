package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * StudyCard entity - Learning card topics
 * Represents main learning topics/cards that students can study
 */
@Entity
@Table(name = "study_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String icon; // Icon name for display (e.g., "book", "calculator", "chart")

    @Column(length = 50)
    private String color; // Color theme for card (e.g., "blue", "green", "purple")

    @Column(nullable = false)
    private Integer displayOrder = 0; // Order for display on study.html

    @Column(nullable = false)
    @JsonProperty("active")
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "studyCard", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @JsonIgnore
    private List<CardSection> sections = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
