package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * StudyProblemEntry entity - Correct accounting entries for StudyProblems
 * Similar to CorrectEntry but specific to Study Card problems
 */
@Entity
@Table(name = "study_problem_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyProblemEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_problem_id", nullable = false)
    @JsonIgnore
    private StudyProblem studyProblem;

    @Column(nullable = false, length = 100)
    private String accountCode; // Hesap kodu (e.g., "100", "320")

    @Column(nullable = false, length = 200)
    private String accountName; // Hesap adı (e.g., "Kasa", "Sermaye")

    @Column(nullable = false)
    private Double debitAmount = 0.0; // Borç tutarı

    @Column(nullable = false)
    private Double creditAmount = 0.0; // Alacak tutarı

    @Column(length = 500)
    private String explanation; // Açıklama
}
