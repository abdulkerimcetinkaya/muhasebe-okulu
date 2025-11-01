package com.example.muhasebeokulu5.dto;

import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
public class UserEntryDTO {
    private Long problemId;
    private List<EntryLine> entries;
    private String userId; // Frontend'den string olarak geliyor

    @Data
    public static class EntryLine {
        private String accountCode;
        private BigDecimal debit;
        private BigDecimal credit;
    }
}
