package com.example.muhasebeokulu5.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Table(name = "correct_entries")
@Data
@ToString(exclude = {"problem"})
public class CorrectEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Doğru ilişki — Problem nesnesi JSON’dan alınır
    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Problem problem;

    @Column(nullable = false)
    private String accountCode;

    @Column(nullable = false)
    private String accountName;

    @Column(nullable = false)
    private double debit;

    @Column(nullable = false)
    private double credit;
}
