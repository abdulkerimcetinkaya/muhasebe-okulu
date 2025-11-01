package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * FREE modda kullanıcının mali tablo göndermesi
 * (Tüm yevmiye kayıtlarını tamamladıktan sonra)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialStatementSubmissionRequest {
    private Long progressId;
    private IncomeStatement incomeStatement;
    private BalanceSheet balanceSheet;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IncomeStatement {
        private List<AccountLine> revenues;  // Gelirler
        private List<AccountLine> expenses;  // Giderler
        private BigDecimal totalRevenue;
        private BigDecimal totalExpense;
        private BigDecimal netIncome;  // Net Kar/Zarar
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceSheet {
        private List<AccountLine> assets;  // Aktifler
        private List<AccountLine> liabilities;  // Borçlar
        private List<AccountLine> equity;  // Özkaynaklar
        private BigDecimal totalAssets;
        private BigDecimal totalLiabilities;
        private BigDecimal totalEquity;
        private BigDecimal totalLiabilitiesAndEquity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountLine {
        private String accountCode;
        private String accountName;
        private BigDecimal amount;
    }
}
