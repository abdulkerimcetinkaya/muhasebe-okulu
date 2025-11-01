package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.DailyActivityDTO;
import com.example.muhasebeokulu5.dto.ChangePasswordDTO;
import com.example.muhasebeokulu5.dto.UpdateProfileDTO;
import com.example.muhasebeokulu5.dto.UserProfileDTO;
import com.example.muhasebeokulu5.dto.UserResponse;
import com.example.muhasebeokulu5.entities.Role;
import com.example.muhasebeokulu5.entities.SolvedProblem;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.entities.UserAnswer;
import com.example.muhasebeokulu5.exception.BadRequestException;
import com.example.muhasebeokulu5.exception.ResourceNotFoundException;
import com.example.muhasebeokulu5.repository.SolvedProblemRepository;
import com.example.muhasebeokulu5.repository.UserAnswerRepository;
import com.example.muhasebeokulu5.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SolvedProblemRepository solvedProblemRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, SolvedProblemRepository solvedProblemRepository,
                      UserAnswerRepository userAnswerRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.solvedProblemRepository = solvedProblemRepository;
        this.userAnswerRepository = userAnswerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Note: register() and login() methods removed - authentication is handled by AuthController

    public List<UserResponse> getAllUsers() {
        try {
            return userRepository.findAll()
                    .stream()
                    .map(user -> UserResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .role(user.getRole().name())
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Kullanıcılar listelenirken hata oluştu: " + e.getMessage(), e);
        }
    }

    public UserProfileDTO getUserProfile(UUID userId) {
        try {
            if (userId == null) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı (ID: " + userId + ")"));

            List<SolvedProblem> solvedProblems = solvedProblemRepository.findByUserId(userId);

            List<UserProfileDTO.SolvedProblemDTO> solvedList = solvedProblems.stream()
                    .map(sp -> {
                        // Her çözülen problem için oda bilgisini bul
                        List<UserAnswer> answers = userAnswerRepository.findByUserIdAndProblemIdOrderByAnswerTimeDesc(
                                userId,
                                sp.getProblem().getId()
                        );

                        // Room functionality has been archived

                        return new UserProfileDTO.SolvedProblemDTO(
                                sp.getProblem().getId(),
                                sp.getProblem().getTitle(),
                                sp.getEarnedPoints(),
                                sp.getSolvedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"))
                        );
                    })
                    .collect(Collectors.toList());

            return new UserProfileDTO(
                    user.getId(),
                    user.getUsername(),
                    user.getTotalScore(),
                    user.getSolvedCount(),
                    solvedList,
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getPhoneNumber(),
                    user.getProfilePicture(),
                    user.getBio(),
                    user.getBirthDate(),
                    user.getProfession(),
                    user.getCompany(),
                    user.getJobTitle(),
                    user.getExperienceYears(),
                    user.getEducation(),
                    user.getUniversity(),
                    user.getDailyStreak(),
                    user.getMaxStreak(),
                    user.getLastActiveDate(),
                    user.getTotalTimeSpent(),
                    user.getBadgeCount(),
                    user.getBadges(),
                    user.getPreferredLanguage(),
                    user.getTimezone(),
                    user.getEmailNotifications(),
                    user.getPublicProfile(),
                    user.getLinkedinUrl(),
                    user.getWebsite(),
                    user.getLastLoginDate(),
                    user.getLastLoginIp(),
                    user.getIsEmailVerified()
            );
        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Profil bilgileri getirilirken hata oluştu: " + e.getMessage(), e);
        }
    }
    
    // Kullanıcı adından ID al
    public UUID getUserIdByUsername(String username) {
        try {
            if (username == null || username.trim().isEmpty()) {
                return null;
            }
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            return userOpt.map(User::getId).orElse(null);
        } catch (Exception e) {
            System.err.println("Kullanıcı ID alınamadı: " + e.getMessage());
            return null;
        }
    }
    
    // Profil güncelle
    public UserProfileDTO updateProfile(UUID userId, UpdateProfileDTO updateProfileDTO) {
        try {
            if (userId == null) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı (ID: " + userId + ")"));

            // Kişisel bilgileri güncelle
            if (updateProfileDTO.getFirstName() != null) {
                user.setFirstName(updateProfileDTO.getFirstName());
            }
            if (updateProfileDTO.getLastName() != null) {
                user.setLastName(updateProfileDTO.getLastName());
            }
            if (updateProfileDTO.getEmail() != null) {
                user.setEmail(updateProfileDTO.getEmail());
            }
            if (updateProfileDTO.getPhoneNumber() != null) {
                user.setPhoneNumber(updateProfileDTO.getPhoneNumber());
            }
            if (updateProfileDTO.getProfilePicture() != null) {
                user.setProfilePicture(updateProfileDTO.getProfilePicture());
            }
            if (updateProfileDTO.getBio() != null) {
                user.setBio(updateProfileDTO.getBio());
            }
            if (updateProfileDTO.getBirthDate() != null) {
                user.setBirthDate(updateProfileDTO.getBirthDate());
            }

            // Profesyonel bilgileri güncelle (serbest metin)
            if (updateProfileDTO.getProfession() != null && !updateProfileDTO.getProfession().trim().isEmpty()) {
                user.setProfession(updateProfileDTO.getProfession().trim());
            }
            if (updateProfileDTO.getCompany() != null) {
                user.setCompany(updateProfileDTO.getCompany());
            }
            if (updateProfileDTO.getJobTitle() != null) {
                user.setJobTitle(updateProfileDTO.getJobTitle());
            }
            if (updateProfileDTO.getExperienceYears() != null) {
                user.setExperienceYears(updateProfileDTO.getExperienceYears());
            }
            if (updateProfileDTO.getEducation() != null) {
                user.setEducation(updateProfileDTO.getEducation());
            }
            if (updateProfileDTO.getUniversity() != null) {
                user.setUniversity(updateProfileDTO.getUniversity());
            }

            // Tercihleri güncelle
            if (updateProfileDTO.getPreferredLanguage() != null) {
                user.setPreferredLanguage(updateProfileDTO.getPreferredLanguage());
            }
            if (updateProfileDTO.getTimezone() != null) {
                user.setTimezone(updateProfileDTO.getTimezone());
            }
            if (updateProfileDTO.getEmailNotifications() != null) {
                user.setEmailNotifications(updateProfileDTO.getEmailNotifications());
            }
            if (updateProfileDTO.getPublicProfile() != null) {
                user.setPublicProfile(updateProfileDTO.getPublicProfile());
            }

            // Sosyal medya
            if (updateProfileDTO.getLinkedinUrl() != null) {
                user.setLinkedinUrl(updateProfileDTO.getLinkedinUrl());
            }
            if (updateProfileDTO.getWebsite() != null) {
                user.setWebsite(updateProfileDTO.getWebsite());
            }

            User savedUser = userRepository.save(user);

            // UserProfileDTO'ya dönüştür
            List<SolvedProblem> solvedProblems = solvedProblemRepository.findByUserId(userId);
            List<UserProfileDTO.SolvedProblemDTO> solvedList = solvedProblems.stream()
                    .map(sp -> new UserProfileDTO.SolvedProblemDTO(
                            sp.getProblem().getId(),
                            sp.getProblem().getTitle(),
                            sp.getEarnedPoints(),
                            sp.getSolvedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm"))
                    ))
                    .collect(Collectors.toList());

            return new UserProfileDTO(
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getTotalScore(),
                    savedUser.getSolvedCount(),
                    solvedList,
                    savedUser.getFirstName(),
                    savedUser.getLastName(),
                    savedUser.getEmail(),
                    savedUser.getPhoneNumber(),
                    savedUser.getProfilePicture(),
                    savedUser.getBio(),
                    savedUser.getBirthDate(),
                    savedUser.getProfession(),
                    savedUser.getCompany(),
                    savedUser.getJobTitle(),
                    savedUser.getExperienceYears(),
                    savedUser.getEducation(),
                    savedUser.getUniversity(),
                    savedUser.getDailyStreak(),
                    savedUser.getMaxStreak(),
                    savedUser.getLastActiveDate(),
                    savedUser.getTotalTimeSpent(),
                    savedUser.getBadgeCount(),
                    savedUser.getBadges(),
                    savedUser.getPreferredLanguage(),
                    savedUser.getTimezone(),
                    savedUser.getEmailNotifications(),
                    savedUser.getPublicProfile(),
                    savedUser.getLinkedinUrl(),
                    savedUser.getWebsite(),
                    savedUser.getLastLoginDate(),
                    savedUser.getLastLoginIp(),
                    savedUser.getIsEmailVerified()
            );

        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Profil güncellenirken hata oluştu: " + e.getMessage(), e);
        }
    }

    /**
     * Kullanıcının son 7 günlük aktivite verilerini getirir
     */
    public List<DailyActivityDTO> getWeeklyActivity(UUID userId) {
        try {
            System.out.println("🔍 getWeeklyActivity çağrıldı - User ID: " + userId);
            
            if (userId == null) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }

            // Kullanıcının varlığını kontrol et
            userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı (ID: " + userId + ")"));

            LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
            System.out.println("📅 Haftalık aktivite sorgusu - User ID: " + userId + ", Week ago: " + weekAgo);
            
            List<Object[]> dailySolutions = solvedProblemRepository.findDailySolutionsByUser(userId, weekAgo);
            System.out.println("📊 Bulunan günlük çözümler: " + dailySolutions.size());

            // Bu haftanın Pazartesi'sinden başlayıp Pazar'a kadar listele
            List<DailyActivityDTO> weeklyActivity = new ArrayList<>();
            LocalDate today = LocalDate.now();

            // Bu haftanın Pazartesi'sini bul (DayOfWeek.MONDAY = 1)
            LocalDate monday = today.with(java.time.DayOfWeek.MONDAY);
            System.out.println("📅 Bu haftanın Pazartesi: " + monday + ", Bugün: " + today);

            // Pazartesi'den Pazar'a kadar 7 gün (0=Pazartesi, 6=Pazar)
            for (int i = 0; i < 7; i++) {
                LocalDate date = monday.plusDays(i);
                int problemCount = 0;

                // Bu tarihte çözüm var mı kontrol et
                for (Object[] solution : dailySolutions) {
                    try {
                        Object dateObj = solution[0];
                        LocalDate solutionDate;

                        // Veritabanından gelen tarih tipini kontrol et ve dönüştür
                        if (dateObj instanceof Date) {
                            solutionDate = ((Date) dateObj).toLocalDate();
                        } else if (dateObj instanceof Timestamp) {
                            solutionDate = ((Timestamp) dateObj).toLocalDateTime().toLocalDate();
                        } else if (dateObj instanceof LocalDate) {
                            solutionDate = (LocalDate) dateObj;
                        } else {
                            // String olarak gelirse parse et
                            solutionDate = LocalDate.parse(dateObj.toString());
                        }

                        if (solutionDate.equals(date)) {
                            problemCount = ((Number) solution[1]).intValue();
                            break;
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Tarih dönüştürme hatası: " + e.getMessage());
                        System.err.println("   Veri tipi: " + solution[0].getClass().getName());
                        System.err.println("   Veri değeri: " + solution[0]);
                        continue;
                    }
                }

                weeklyActivity.add(new DailyActivityDTO(date, problemCount));
            }

            return weeklyActivity;

        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Haftalık aktivite verileri alınırken hata oluştu: " + e.getMessage(), e);
        }
    }

    /**
     * Kullanıcı şifresini değiştirir
     */
    public void changePassword(UUID userId, ChangePasswordDTO changePasswordDTO) {
        try {
            if (userId == null) {
                throw new BadRequestException("Kullanıcı ID boş olamaz");
            }

            if (changePasswordDTO.getCurrentPassword() == null || changePasswordDTO.getCurrentPassword().trim().isEmpty()) {
                throw new BadRequestException("Mevcut şifre boş olamaz");
            }

            if (changePasswordDTO.getNewPassword() == null || changePasswordDTO.getNewPassword().trim().isEmpty()) {
                throw new BadRequestException("Yeni şifre boş olamaz");
            }

            if (changePasswordDTO.getNewPassword().length() < 8) {
                throw new BadRequestException("Yeni şifre en az 8 karakter olmalıdır");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı (ID: " + userId + ")"));

            // Mevcut şifreyi kontrol et
            if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Mevcut şifre yanlış");
            }

            // Yeni şifreyi hashle ve kaydet
            String hashedNewPassword = passwordEncoder.encode(changePasswordDTO.getNewPassword());
            user.setPassword(hashedNewPassword);
            
            userRepository.save(user);

        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Şifre değiştirilirken hata oluştu: " + e.getMessage(), e);
        }
    }
}