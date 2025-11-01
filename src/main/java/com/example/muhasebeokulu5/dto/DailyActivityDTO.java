package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyActivityDTO {
    private LocalDate date;
    private int problemCount;
    private String dayName;
    
    public DailyActivityDTO(LocalDate date, int problemCount) {
        this.date = date;
        this.problemCount = problemCount;
        this.dayName = getDayNameTurkish(date);
    }
    
    private String getDayNameTurkish(LocalDate date) {
        String[] days = {"Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"};
        return days[date.getDayOfWeek().getValue() - 1];
    }
}
