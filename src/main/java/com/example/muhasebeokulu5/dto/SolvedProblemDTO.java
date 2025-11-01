package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolvedProblemDTO {
    private String problemTitle;
    private boolean correct;
    private int pointsEarned;
    private String solvedDate;
}
