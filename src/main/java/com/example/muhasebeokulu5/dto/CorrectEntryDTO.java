package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CorrectEntryDTO {
    private String accountCode;
    private double debit;
    private double credit;
    private String description;
}
