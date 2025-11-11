package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * StudyQuestionOption entity - Answer options for StudyQuestions
 * Similar to Option but specific to Study Card quiz questions
 */
@Entity
@Table(name = "study_question_options")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyQuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_question_id", nullable = false)
    @JsonIgnore
    private StudyQuestion studyQuestion;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(nullable = false)
    private Boolean isCorrect = false;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(columnDefinition = "TEXT")
    private String explanation; // Optional explanation for why this is correct/incorrect
}
