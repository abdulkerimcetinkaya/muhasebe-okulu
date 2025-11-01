package com.example.muhasebeokulu5.entities;

public enum Profession {
    STUDENT("Öğrenci"),
    ACCOUNTANT("Muhasebeci"),
    AUDITOR("Denetçi"),
    CFO("Mali İşler Müdürü"),
    TAX_CONSULTANT("Mali Müşavir"),
    FINANCIAL_ANALYST("Finansal Analist"),
    BOOKKEEPER("Defter Tutan"),
    OTHER("Diğer");

    private final String displayName;

    Profession(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
