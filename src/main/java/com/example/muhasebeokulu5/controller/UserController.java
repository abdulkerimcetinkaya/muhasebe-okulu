package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.ChangePasswordDTO;
import com.example.muhasebeokulu5.dto.DailyActivityDTO;
import com.example.muhasebeokulu5.dto.SolvedProblemSummaryDTO;
import com.example.muhasebeokulu5.dto.UpdateProfileDTO;
import com.example.muhasebeokulu5.dto.UserProfileDTO;
import com.example.muhasebeokulu5.dto.UserResponse;
import com.example.muhasebeokulu5.service.SolvedProblemService;
import com.example.muhasebeokulu5.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final SolvedProblemService solvedProblemService;

    public UserController(UserService userService, SolvedProblemService solvedProblemService) {
        this.userService = userService;
        this.solvedProblemService = solvedProblemService;
    }

    // 🔹 Tüm kullanıcıları listele (sadece admin görecek şekilde ileride kontrol eklenecek)
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ YENİ: Kullanıcı profil bilgilerini getir
    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    // ✅ YENİ: Kullanıcı profil bilgilerini güncelle
    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(@PathVariable UUID id, @RequestBody UpdateProfileDTO updateProfileDTO) {
        return ResponseEntity.ok(userService.updateProfile(id, updateProfileDTO));
    }

    // ✅ YENİ: Kullanıcının haftalık aktivite verilerini getir
    @GetMapping("/{id}/activity")
    public ResponseEntity<List<DailyActivityDTO>> getUserWeeklyActivity(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getWeeklyActivity(id));
    }

    // ✅ YENİ: Kullanıcının çözülen problemlerini getir
    @GetMapping("/{id}/solved-problems")
    public ResponseEntity<List<SolvedProblemSummaryDTO>> getUserSolvedProblems(@PathVariable UUID id, @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(solvedProblemService.getSolvedProblemsByUserId(id));
    }

    // ✅ YENİ: Kullanıcı şifresini değiştir
    @PostMapping("/{id}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable UUID id, @RequestBody ChangePasswordDTO changePasswordDTO) {
        userService.changePassword(id, changePasswordDTO);
        return ResponseEntity.ok("Şifre başarıyla değiştirildi");
    }
}