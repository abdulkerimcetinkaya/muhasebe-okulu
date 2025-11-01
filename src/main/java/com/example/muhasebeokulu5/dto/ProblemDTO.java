package com.example.muhasebeokulu5.dto;


import com.example.muhasebeokulu5.entities.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDTO {
    private Long id;
    private String title;
    private String content;
    private String hint;
    private String tags;
    private Difficulty difficulty;
    private Boolean solved; // Kullanıcının bu problemi çözüp çözmediği (null, true, false)
    private LocalDateTime createdAt;
    private Long solveCount;
    private Double successRate;
    private List<Object> correctEntries;
    // Room-specific isPrivate field has been archived
    private UUID createdBy; // Kim oluşturdu (teacherId)

}

