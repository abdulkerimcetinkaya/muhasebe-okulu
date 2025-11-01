package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private UUID id;
    private String username;
    private int totalScore;
    private int solvedCount;
    private List<SolvedProblemDTO> solvedProblems;

    // Kişisel Bilgiler
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String profilePicture;
    private String bio;
    private LocalDate birthDate;

    // Profesyonel Bilgiler
    private String profession;
    private String company;
    private String jobTitle;
    private Integer experienceYears;
    private String education;
    private String university;

    // Platform İstatistikleri
    private Integer dailyStreak;
    private Integer maxStreak;
    private LocalDate lastActiveDate;
    private Integer totalTimeSpent;
    private Integer badgeCount;
    private String badges;

    // Tercihler
    private String preferredLanguage;
    private String timezone;
    private Boolean emailNotifications;
    private Boolean publicProfile;

    // Sosyal
    private String linkedinUrl;
    private String website;

    // Platform
    private LocalDateTime lastLoginDate;
    private String lastLoginIp;
    private Boolean isEmailVerified;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SolvedProblemDTO {
        private Long problemId;
        private String problemTitle;
        private int earnedPoints;
        private String solvedAt;
        // Room fields have been archived
    }
}