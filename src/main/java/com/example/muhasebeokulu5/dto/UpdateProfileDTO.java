package com.example.muhasebeokulu5.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileDTO {

    // Kişisel Bilgiler
    @Size(min = 2, max = 50, message = "Ad 2-50 karakter arasında olmalıdır")
    private String firstName;

    @Size(min = 2, max = 50, message = "Soyad 2-50 karakter arasında olmalıdır")
    private String lastName;

    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Geçerli bir telefon numarası giriniz")
    private String phoneNumber;

    @Size(max = 500, message = "Profil fotoğrafı URL'si maksimum 500 karakter olabilir")
    private String profilePicture;

    @Size(max = 1000, message = "Bio maksimum 1000 karakter olabilir")
    private String bio;

    @Past(message = "Doğum tarihi geçmişte olmalıdır")
    private LocalDate birthDate;

    // Profesyonel Bilgiler
    @Size(max = 100, message = "Meslek maksimum 100 karakter olabilir")
    private String profession;

    @Size(max = 100, message = "Şirket adı maksimum 100 karakter olabilir")
    private String company;

    @Size(max = 100, message = "İş unvanı maksimum 100 karakter olabilir")
    private String jobTitle;

    @Min(value = 0, message = "Deneyim yılı negatif olamaz")
    @Max(value = 70, message = "Deneyim yılı maksimum 70 olabilir")
    private Integer experienceYears;

    @Size(max = 200, message = "Eğitim bilgisi maksimum 200 karakter olabilir")
    private String education;

    @Size(max = 100, message = "Üniversite adı maksimum 100 karakter olabilir")
    private String university;

    // Tercihler
    @Pattern(regexp = "tr|en", message = "Dil tercihi sadece 'tr' veya 'en' olabilir")
    private String preferredLanguage;

    @Size(max = 50, message = "Zaman dilimi maksimum 50 karakter olabilir")
    private String timezone;

    private Boolean emailNotifications;
    private Boolean publicProfile;

    // Sosyal
    @Pattern(regexp = "^https?://(www\\.)?linkedin\\.com/.*", message = "Geçerli bir LinkedIn URL'si giriniz")
    private String linkedinUrl;

    @Pattern(regexp = "^https?://.*", message = "Geçerli bir website URL'si giriniz")
    private String website;
}
