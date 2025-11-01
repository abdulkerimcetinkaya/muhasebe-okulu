package com.example.muhasebeokulu5.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private String accountCode;

    @Column(nullable = false)
    private double debit;

    @Column(nullable = false)
    private double credit;

    private String description;

    @Column(nullable = false)
    private LocalDateTime answerTime = LocalDateTime.now();

    // Manuel puanlama için yeni alanlar
    @Column(name = "manual_score")
    private Integer manualScore; // Öğretmen tarafından verilen puan (null = henüz puanlanmamış)

    @ManyToOne
    @JoinColumn(name = "scored_by")
    private User scoredBy; // Puanı veren öğretmen

    @Column(name = "scored_at")
    private LocalDateTime scoredAt; // Puanlama zamanı

    @Column(name = "teacher_feedback")
    private String teacherFeedback; // Öğretmen yorumu

    @Column(name = "review_status")
    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus = ReviewStatus.PENDING; // PENDING, REVIEWED

    // Room reference has been archived

    public enum ReviewStatus {
        PENDING,    // Henüz incelenmedi
        REVIEWED    // İncelendi ve puanlandı
    }
}