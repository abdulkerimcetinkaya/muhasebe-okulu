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

    // Platform İstatistikleri - Yıldız Sistemi
    @Builder.Default
    @Column(name = "total_stars")
    private Integer totalStars = 0;         // Toplam yıldız puanı
    @Builder.Default
    @Column(name = "bonus_stars")
    private Integer bonusStars = 0;         // Bonus yıldızlar (ilk deneme, streak vb)
    @Builder.Default
    @Column(name = "current_streak")
    private Integer currentStreak = 0;      // Günlük seri
    @Builder.Default
    @Column(name = "best_streak")
    private Integer bestStreak = 0;         // Maksimum seri
    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;     // Son aktivite tarihi
    @Builder.Default
    @Column(name = "total_quizzes_completed")
    private Integer totalQuizzesCompleted = 0;  // Tamamlanan quiz sayısı
    @Builder.Default
    private Integer totalTimeSpent = 0;     // Toplam harcanan süre (dakika)

    // Eski alanlar (geriye dönük uyumluluk için - silinebilir)
    @Builder.Default
    private Integer dailyStreak = 0;        // Deprecated: currentStreak kullanın
    @Builder.Default
    private Integer maxStreak = 0;          // Deprecated: bestStreak kullanın
    private LocalDate lastActiveDate;       // Deprecated: lastActivityDate kullanın
    @Builder.Default
    private Integer badgeCount = 0;         // Deprecated: rozet sistemi kaldırıldı
    private String badges;                  // Deprecated: rozet sistemi kaldırıldı

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

    // ============================================
    // 🎯 LEVEL SYSTEM (Seviye Sistemi)
    // ============================================
    // Progressive difficulty system (1-10 levels)
    // Users earn points and advance through levels based on performance

    @Builder.Default
    @Column(name = "current_level")
    private Integer currentLevel = 1;  // Current level (1-10)

    @Builder.Default
    @Column(name = "level_points")
    private Integer levelPoints = 0;  // Points accumulated in current level

    @Builder.Default
    @Column(name = "placement_test_completed")
    private Boolean placementTestCompleted = false;  // Has user completed initial placement test?

    @Column(name = "placement_test_score")
    private Integer placementTestScore;  // Score from placement test (0-7 questions, null if skipped)

    @Column(name = "placement_test_date")
    private LocalDateTime placementTestDate;  // When placement test was completed

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastActiveDate = LocalDate.now();
        lastLoginDate = LocalDateTime.now();
    }
}