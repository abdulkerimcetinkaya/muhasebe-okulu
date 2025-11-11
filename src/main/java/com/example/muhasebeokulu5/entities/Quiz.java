package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@ToString(exclude = {"questions", "userQuizAnswers"})
@EqualsAndHashCode(exclude = {"questions", "userQuizAnswers"})
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"questions", "userQuizAnswers", "hibernateLazyInitializer", "handler"})
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes; // Quiz için süre sınırı (dakika)

    @Column(nullable = false)
    private Integer difficulty; // 1: Kolay, 2: Orta, 3: Zor

    @Column(name = "pass_percentage", nullable = false)
    private Integer passPercentage = 70; // Geçme notu yüzdesi

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by")
    private Long createdBy; // Admin/Teacher ID

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Question> questions = new HashSet<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserQuizAnswer> userQuizAnswers = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
