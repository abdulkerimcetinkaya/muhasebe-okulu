package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolvedProblemSummaryDTO {
    private Long problemId;
    private String problemTitle;
    private int earnedPoints;
    private String solvedAt;
    // Room fields have been archived
}