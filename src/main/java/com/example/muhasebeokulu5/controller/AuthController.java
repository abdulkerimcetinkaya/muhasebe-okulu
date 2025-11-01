package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.LoginRequest;
import com.example.muhasebeokulu5.dto.RegisterRequest;
import com.example.muhasebeokulu5.dto.AuthResponse;
import com.example.muhasebeokulu5.entities.Role;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.exception.BadRequestException;
import com.example.muhasebeokulu5.repository.UserRepository;
import com.example.muhasebeokulu5.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // E-posta kontrolü
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new BadRequestException("Bu e-posta adresi zaten kullanılıyor!");
            }

            // Şifre eşleşme kontrolü (business logic)
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                throw new BadRequestException("Şifreler eşleşmiyor");
            }

            // Otomatik kullanıcı adı oluştur (firstName + rastgele 4 haneli sayı)
            String generatedUsername = generateUniqueUsername(request.getFirstName().trim());

            // Yeni kullanıcı oluştur
            User user = User.builder()
                    .username(generatedUsername)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.valueOf(request.getRole().toUpperCase()))
                    .firstName(request.getFirstName().trim())
                    .lastName(request.getLastName().trim())
                    .email(request.getEmail().trim().toLowerCase())
                    .totalScore(0)
                    .solvedCount(0)
                    .build();

            User savedUser = userRepository.save(user);

            // JWT token oluştur
            String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getUsername());

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getRole().name()
            ));

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Kayıt olurken hata oluştu: " + e.getMessage(), e);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            // E-posta ile kullanıcıyı bul
            User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new BadRequestException("E-posta veya şifre hatalı!"));

            // Kullanıcı adı ve şifre ile kimlik doğrulama
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );

            // JWT token oluştur
            String token = jwtUtil.generateToken(user.getId(), user.getUsername());

            return ResponseEntity.ok(new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name()
            ));

        } catch (BadCredentialsException e) {
            throw new BadRequestException("E-posta veya şifre hatalı!");
        } catch (Exception e) {
            throw new RuntimeException("Giriş yapılırken hata oluştu: " + e.getMessage(), e);
        }
    }

    /**
     * Benzersiz kullanıcı adı oluştur: firstName + 4 haneli rastgele sayı
     * Eğer bu kullanıcı adı zaten varsa, farklı sayı dene (max 10 deneme)
     */
    private String generateUniqueUsername(String firstName) {
        // Türkçe karakterleri İngilizce karşılıklarına çevir ve küçük harfe dönüştür
        String baseUsername = firstName.toLowerCase()
                .replace("ı", "i")
                .replace("ğ", "g")
                .replace("ü", "u")
                .replace("ş", "s")
                .replace("ö", "o")
                .replace("ç", "c")
                .replaceAll("[^a-z0-9]", ""); // Özel karakterleri temizle

        // En az 3, en fazla 20 karakter olsun
        if (baseUsername.length() < 3) {
            baseUsername = baseUsername + "user";
        } else if (baseUsername.length() > 20) {
            baseUsername = baseUsername.substring(0, 20);
        }

        // 10 kez dene, benzersiz kullanıcı adı oluştur
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 10; i++) {
            int randomNumber = 1000 + random.nextInt(9000); // 1000-9999 arası 4 haneli sayı
            String username = baseUsername + randomNumber;

            if (userRepository.findByUsername(username).isEmpty()) {
                return username;
            }
        }

        // 10 denemede bulunamadıysa, timestamp ekle
        long timestamp = System.currentTimeMillis() % 10000;
        return baseUsername + timestamp;
    }
}