package com.example.muhasebeokulu5.entities;

/**
 * Yevmiye kaydı türü
 */
public enum EntryType {
    OPENING,        // Açılış kayıtları
    TRANSACTION,    // Normal işlem kayıtları
    ADJUSTMENT,     // Düzeltme kayıtları (dönem sonu)
    CLOSING         // Kapanış kayıtları
}
