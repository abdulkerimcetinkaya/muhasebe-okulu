package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

/**
 * StudyQuestion entity - Questions within a StudyQuiz
 * Similar to Question but specific to Study Card quizzes
 */
@Entity
@Table(name = "study_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_quiz_id", nullable = false)
    @JsonIgnore
    private StudyQuiz studyQuiz;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType = QuestionType.MULTIPLE_CHOICE;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Integer points = 1; // Points for this question

    @OneToMany(mappedBy = "studyQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<StudyQuestionOption> options = new ArrayList<>();

    /**
     * Question types for study questions
     */
    public enum QuestionType {
        MULTIPLE_CHOICE,  // Çoktan seçmeli
        TRUE_FALSE,       // Doğru/Yanlış
        SHORT_ANSWER      // Kısa cevap
    }
}
