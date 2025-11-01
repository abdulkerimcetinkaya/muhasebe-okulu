package com.example.muhasebeokulu5.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;

    @Builder.Default
    private Integer totalScore = 0;
    @Builder.Default
    private Integer solvedCount = 0;

    // 🆕 YENİ ALAN - Kayıt tarihi
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Kişisel Bilgiler
    private String firstName;           // Ad
    private String lastName;            // Soyad
    private String email;               // E-posta (unique)
    private String phoneNumber;         // Telefon
    private String profilePicture;      // Profil fotoğrafı URL
    private String bio;                 // Hakkımda (kısa biyografi)
    private LocalDate birthDate;        // Doğum tarihi

    // Profesyonel Bilgiler
    private String profession;          // Meslek (serbest metin, max 100 karakter)
    private String company;             // Çalıştığı şirket
    private String jobTitle;            // İş unvanı
    private Integer experienceYears;    // Deneyim yılı
    private String education;           // Eğitim durumu
    private String university;          // Üniversite adı

    // Platform İstatistikleri
    @Builder.Default
    private Integer dailyStreak = 0;        // Günlük seri
    @Builder.Default
    private Integer maxStreak = 0;          // Maksimum seri
    private LocalDate lastActiveDate;       // Son aktif olduğu tarih
    @Builder.Default
    private Integer totalTimeSpent = 0;     // Toplam harcanan süre (dakika)
    @Builder.Default
    private Integer badgeCount = 0;         // Kazanılan rozet sayısı
    private String badges;                  // JSON formatında rozet listesi

    // Tercihler
    @Builder.Default
    private String preferredLanguage = "tr";  // Dil tercihi
    @Builder.Default
    private String timezone = "Europe/Istanbul";  // Zaman dilimi
    @Builder.Default
    private Boolean emailNotifications = true;  // Bildirim tercihi
    @Builder.Default
    private Boolean publicProfile = true;  // Profil görünürlüğü

    // Sosyal
    private String linkedinUrl;  // LinkedIn profili
    private String website;  // Kişisel website

    // Platform
    private LocalDateTime lastLoginDate;  // Son giriş
    private String lastLoginIp;  // Güvenlik
    @Builder.Default
    private Boolean isEmailVerified = false;  // Email doğrulama

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastActiveDate = LocalDate.now();
        lastLoginDate = LocalDateTime.now();
    }
}