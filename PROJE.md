# 📚 MUHASEBE OKULU - KAPSAMLI PROJE DOKÜMANTASYONU

## 📋 İÇİNDEKİLER
1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Mimari Yapı](#mimari-yapı)
4. [Veritabanı Şeması](#veritabanı-şeması)
5. [Backend Detayları](#backend-detayları)
6. [Frontend Detayları](#frontend-detayları)
7. [Güvenlik ve Yetkilendirme](#güvenlik-ve-yetkilendirme)
8. [API Endpoint'leri](#api-endpointleri)
9. [Özellikler ve Fonksiyonlar](#özellikler-ve-fonksiyonlar)
10. [Kullanıcı Rolleri](#kullanıcı-rolleri)
11. [Geliştirme Notları](#geliştirme-notları)

---

## 🎯 PROJE GENEL BAKIŞ

**MuhasebeOkulu**, muhasebe öğrencileri ve profesyonelleri için interaktif bir öğrenme platformudur. Kullanıcılar gerçek dünya senaryolarına dayalı muhasebe problemlerini çözerek pratik yaparlar ve ilerlemelerini takip ederler.

### Temel Özellikler
- ✅ **İnteraktif Problem Çözme**: Yevmiye kayıtları yaparak muhasebe mantığını öğrenme
- 📊 **İlerleme Takibi**: Çözülen problemler, puanlar ve istatistikler
- 👥 **Kullanıcı Yönetimi**: USER ve ADMIN rolleri ile çok seviyeli yetkilendirme
- 🔐 **JWT Authentication**: Güvenli token tabanlı kimlik doğrulama
- 📈 **Dashboard ve Raporlar**: Kişiselleştirilmiş kullanıcı ve admin panelleri
- 💬 **Tartışma Forumu**: Problemler hakkında tartışma ve yorum yapma
- 🎓 **Zorluk Seviyeleri**: KOLAY (10 puan), ORTA (20 puan), ZOR (30 puan)
- 🏆 **Gamification**: Puan sistemi, rozetler, günlük seriler

### Proje Bilgileri
- **Grup ID**: com.example
- **Artifact ID**: muhasebe-okulu-5
- **Versiyon**: 0.0.1-SNAPSHOT
- **Java Versiyon**: 17
- **Spring Boot Versiyon**: 3.5.7
- **Database**: PostgreSQL
- **Port**: 8080

---

## 🛠️ TEKNOLOJİ STACK

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| **Spring Boot** | 3.5.7 | Backend framework |
| **Spring Security** | - | Güvenlik ve yetkilendirme |
| **Spring Data JPA** | - | ORM ve database işlemleri |
| **JWT (jjwt)** | 0.12.3 | Token tabanlı authentication |
| **PostgreSQL** | - | İlişkisel veritabanı |
| **Lombok** | - | Boilerplate kod azaltma |
| **ModelMapper** | 3.2.0 | Entity-DTO dönüşümleri |
| **SpringDoc OpenAPI** | 2.5.0 | API dokümantasyonu (Swagger) |
| **BCrypt** | - | Şifre hash'leme |
| **HikariCP** | - | Connection pool yönetimi |

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| **Vanilla JavaScript** | Framework kullanılmadan modern JS |
| **Tailwind CSS** | Utility-first CSS framework |
| **Chart.js** | Grafik ve görselleştirme |
| **Lucide Icons** | Modern SVG icon kütüphanesi |
| **Plus Jakarta Sans** | Google Font |

### Geliştirme Araçları
- **Maven**: Bağımlılık yönetimi ve build tool
- **H2 Database**: Test ortamı için in-memory database
- **Spring Boot DevTools**: Hot reload ve development özellikleri
- **IntelliJ IDEA**: IDE desteği

---

## 🏗️ MİMARİ YAPI

### Proje Katman Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│  (Vanilla JS + Tailwind CSS + HTML Pages)              │
│  - index.html, login.html, dashboard.html, vb.          │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST API
                        │ (JWT Token ile Authentication)
┌───────────────────────▼─────────────────────────────────┐
│                 CONTROLLER LAYER                         │
│  @RestController - REST API Endpoints                   │
│  - AuthController, ProblemController, AdminController    │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  SERVICE LAYER                           │
│  @Service - İş mantığı ve business logic                │
│  - ProblemService, UserService, AdminService             │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                REPOSITORY LAYER                          │
│  @Repository - JPA Repositories (Data Access)           │
│  - ProblemRepository, UserRepository, vb.                │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   DATABASE LAYER                         │
│  PostgreSQL - İlişkisel veritabanı                      │
│  - users, problems, solved_problems, vb.                 │
└─────────────────────────────────────────────────────────┘
```

### Backend Package Yapısı

```
com.example.muhasebeokulu5/
│
├── MuhasebeOkulu5Application.java      # Main application class
│
├── config/                              # Yapılandırma sınıfları
│   ├── CorsConfig.java                 # CORS ayarları
│   ├── ModelMapperConfig.java          # ModelMapper bean
│   └── SwaggerConfig.java              # Swagger/OpenAPI config
│
├── controller/                          # REST Controller'lar
│   ├── AuthController.java             # Login/Register
│   ├── ProblemController.java          # Problem CRUD
│   ├── SolvedProblemController.java    # Çözüm kontrolü
│   ├── UserController.java             # Kullanıcı profil
│   ├── AdminController.java            # Admin işlemleri
│   ├── AdminDashboardController.java   # Admin dashboard
│   ├── AccountPlanController.java      # Hesap planı
│   ├── CorrectEntryController.java     # Doğru cevaplar
│   ├── UserAnswerController.java       # Kullanıcı cevapları
│   ├── DiscussionPostController.java   # Tartışma postları
│   ├── CommentController.java          # Yorumlar
│   ├── AnswerController.java           # Cevaplar
│   ├── PageController.java             # Static sayfa routing
│   ├── TestController.java             # Test endpoints
│   └── DatabaseOptimizationController.java  # DB optimization
│
├── dto/                                 # Data Transfer Objects
│   ├── LoginRequest.java               # Login request DTO
│   ├── RegisterRequest.java            # Register request DTO
│   ├── AuthResponse.java               # Auth response DTO
│   ├── ProblemDTO.java                 # Problem DTO
│   ├── UserManagementDTO.java          # User management DTO
│   ├── ProblemManagementDTO.java       # Problem management DTO
│   ├── CreateProblemDTO.java           # Problem creation DTO
│   ├── ReportDTO.java                  # Report DTO
│   ├── AccountPlanDTO.java             # Hesap planı DTO
│   └── AdminDashboardDTO.java          # Admin dashboard DTO
│
├── entities/                            # JPA Entity'ler
│   ├── User.java                       # Kullanıcı entity
│   ├── Problem.java                    # Problem entity
│   ├── SolvedProblem.java             # Çözülmüş problem entity
│   ├── CorrectEntry.java              # Doğru kayıt entity
│   ├── UserAnswer.java                # Kullanıcı cevabı entity
│   ├── AccountPlan.java               # Hesap planı entity
│   ├── DiscussionPost.java            # Tartışma entity
│   ├── Comment.java                   # Yorum entity
│   ├── Role.java                      # Role enum (USER, ADMIN)
│   ├── Difficulty.java                # Zorluk enum (EASY, MEDIUM, HARD)
│   └── Profession.java                # Meslek enum
│
├── repository/                          # Spring Data JPA Repositories
│   ├── UserRepository.java
│   ├── ProblemRepository.java
│   ├── SolvedProblemRepository.java
│   ├── CorrectEntryRepository.java
│   ├── UserAnswerRepository.java
│   ├── AccountPlanRepository.java
│   ├── DiscussionPostRepository.java
│   └── CommentRepository.java
│
├── service/                             # Business Logic Layer
│   ├── CustomUserDetailsService.java  # Spring Security user details
│   ├── UserService.java               # Kullanıcı işlemleri
│   ├── ProblemService.java            # Problem işlemleri
│   ├── SolvedProblemService.java      # Çözüm işlemleri
│   ├── CorrectEntryService.java       # Doğru cevap işlemleri
│   ├── UserAnswerService.java         # Kullanıcı cevap işlemleri
│   ├── AdminService.java              # Admin işlemleri
│   ├── AdminDashboardService.java     # Admin dashboard
│   ├── AnswerService.java             # Cevap servisi
│   ├── CommentService.java            # Yorum servisi
│   └── DiscussionPostService.java     # Tartışma servisi
│
├── security/                            # Güvenlik bileşenleri
│   ├── SecurityConfig.java            # Spring Security config
│   ├── JwtUtil.java                   # JWT token işlemleri
│   └── JwtRequestFilter.java          # JWT filter
│
└── exception/                           # Exception handling
    ├── BadRequestException.java       # 400 Bad Request
    └── GlobalExceptionHandler.java    # Global exception handler
```

### Frontend Dosya Yapısı

```
src/main/resources/static/
│
├── index.html                  # 🏠 Ana sayfa (Landing page)
├── login.html                  # 🔐 Giriş sayfası
├── register.html               # 📝 Kayıt sayfası
├── dashboard.html              # 📊 Kullanıcı dashboard
├── problems.html               # 📚 Problem listesi
├── problem-detail.html         # 🔍 Problem detay
├── profile.html                # 👤 Kullanıcı profili
├── admin.html                  # 👑 Admin paneli
├── admin-dashboard.html        # 📈 Admin dashboard
│
└── assets/                     # Static kaynaklar
    ├── css/                    # CSS dosyaları
    ├── js/                     # JavaScript dosyaları
    └── images/                 # Görseller
```

---

## 💾 VERİTABANI ŞEMASI

### Entity İlişki Diyagramı (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                            USERS                                 │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (UUID)                                                    │
│ UK: username, email                                              │
│ Fields: password, role, firstName, lastName, email,              │
│         totalScore, solvedCount, dailyStreak, maxStreak,         │
│         profession, company, bio, badges, createdAt, ...         │
└──────────┬──────────────────────────────────────────────────────┘
           │ 1
           │
           │ N
┌──────────▼──────────────────────────────────────────────────────┐
│                       SOLVED_PROBLEMS                            │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (UUID)                                                    │
│ FK: user_id → users(id)                                          │
│ FK: problem_id → problems(id)                                    │
│ Fields: balanced, isCorrect, earnedPoints, solvedAt             │
└──────────┬──────────────────────────────────────────────────────┘
           │ N
           │
           │ 1
┌──────────▼──────────────────────────────────────────────────────┐
│                          PROBLEMS                                │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (BIGINT)                                                  │
│ Fields: title, content, hint, tags, difficulty,                  │
│         createdAt                                                │
└──────────┬──────────────────────────────────────────────────────┘
           │ 1
           │
           │ N
┌──────────▼──────────────────────────────────────────────────────┐
│                      CORRECT_ENTRIES                             │
├─────────────────────────────────────────────────────────────────┤
│ PK: id (BIGINT)                                                  │
│ FK: problem_id → problems(id)                                    │
│ Fields: accountCode, accountName, debit, credit                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tablo Detayları

#### 1. **users** (Kullanıcılar)
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;  // BCrypt hash

    @Enumerated(EnumType.STRING)
    private Role role;  // USER, ADMIN

    // Kişisel Bilgiler
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate birthDate;
    private String bio;

    // Platform İstatistikleri
    private Integer totalScore = 0;
    private Integer solvedCount = 0;
    private Integer dailyStreak = 0;
    private Integer maxStreak = 0;

    // Profesyonel Bilgiler
    @Enumerated(EnumType.STRING)
    private Profession profession;
    private String company;
    private String jobTitle;

    // Tercihler
    private Boolean emailNotifications = true;
    private Boolean publicProfile = true;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginDate;
}
```

#### 2. **problems** (Problemler)
```java
@Entity
@Table(name = "problems")
public class Problem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String hint;
    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;  // EASY, MEDIUM, HARD

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "problem")
    private List<CorrectEntry> correctEntries;

    @OneToMany(mappedBy = "problem")
    private List<SolvedProblem> solvedProblems;
}
```

#### 3. **solved_problems** (Çözülmüş Problemler)
```java
@Entity
@Table(name = "solved_problems")
public class SolvedProblem {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    private boolean balanced;      // Borç-alacak dengesi
    private boolean isCorrect;     // Çözüm doğru mu?
    private int earnedPoints;      // Kazanılan puan

    @Column(nullable = false)
    private LocalDateTime solvedAt;
}
```

#### 4. **correct_entries** (Doğru Kayıtlar)
```java
@Entity
@Table(name = "correct_entries")
public class CorrectEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private String accountCode;     // Örn: "100"

    @Column(nullable = false)
    private String accountName;     // Örn: "Kasa"

    @Column(nullable = false)
    private double debit;           // Borç

    @Column(nullable = false)
    private double credit;          // Alacak
}
```

### Enum Tanımları

#### Difficulty (Zorluk Seviyesi)
```java
public enum Difficulty {
    EASY(10),    // Kolay: 10 puan
    MEDIUM(20),  // Orta: 20 puan
    HARD(30);    // Zor: 30 puan

    private final int points;

    public int getPoints() {
        return points;
    }
}
```

#### Role (Kullanıcı Rolü)
```java
public enum Role {
    USER,    // Normal kullanıcı
    ADMIN    // Yönetici
}
```

---

## 🔧 BACKEND DETAYLARI

### Spring Security Yapılandırması

#### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/problems/**").permitAll()
                .requestMatchers("/api/solved-problems/**").permitAll()
                .requestMatchers("/*.html").permitAll()
                .requestMatchers("/static/**", "/assets/**").permitAll()

                // Protected endpoints
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/admin/**").authenticated()

                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### JWT Token Sistemi

#### JWT Token Oluşturma
```java
public String generateToken(UUID userId, String username) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", userId.toString());

    return Jwts.builder()
        .setClaims(claims)
        .setSubject(username)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

#### JWT Token Doğrulama
```java
public boolean validateToken(String token, String username) {
    final String tokenUsername = getUsernameFromToken(token);
    return (tokenUsername.equals(username) && !isTokenExpired(token));
}
```

### Database Optimizasyonları

#### HikariCP Connection Pool
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

#### Hibernate Batch Processing
```properties
spring.jpa.properties.hibernate.jdbc.batch_size=25
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### Service Layer Mantığı

#### Problem Çözüm Kontrolü
```java
public SolutionResult checkSolution(Long problemId, UUID userId, List<UserEntry> userEntries) {
    // 1. Doğru cevapları al
    List<CorrectEntry> correctEntries = correctEntryRepository.findByProblemId(problemId);

    // 2. Borç-Alacak dengesini kontrol et
    double userDebitTotal = userEntries.stream().mapToDouble(UserEntry::getDebit).sum();
    double userCreditTotal = userEntries.stream().mapToDouble(UserEntry::getCredit).sum();
    boolean balanced = Math.abs(userDebitTotal - userCreditTotal) < 0.01;

    // 3. Kayıtları karşılaştır
    boolean isCorrect = compareEntries(userEntries, correctEntries);

    // 4. Puan hesapla
    int earnedPoints = 0;
    if (isCorrect && balanced) {
        Problem problem = problemRepository.findById(problemId).orElseThrow();
        earnedPoints = problem.getDifficulty().getPoints();

        // Kullanıcı puanını güncelle
        User user = userRepository.findById(userId).orElseThrow();
        user.setTotalScore(user.getTotalScore() + earnedPoints);
        user.setSolvedCount(user.getSolvedCount() + 1);
        userRepository.save(user);
    }

    // 5. Çözüm kaydını oluştur
    SolvedProblem solvedProblem = new SolvedProblem();
    solvedProblem.setUser(user);
    solvedProblem.setProblem(problem);
    solvedProblem.setBalanced(balanced);
    solvedProblem.setCorrect(isCorrect);
    solvedProblem.setEarnedPoints(earnedPoints);
    solvedProblemRepository.save(solvedProblem);

    return new SolutionResult(isCorrect, balanced, earnedPoints);
}
```

---

## 🎨 FRONTEND DETAYLARI

### Sayfa Yapısı ve Özellikleri

#### 1. **index.html** - Ana Sayfa
**Bölümler**:
- Hero section (platform tanıtımı)
- İstatistik kartları (CountUp animasyonu)
- Özellik kartları
- Chart.js örnek grafiği
- Footer

**JavaScript Fonksiyonları**:
```javascript
// Authentication kontrolü
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        showUserInterface(user);
    } else {
        showGuestInterface();
    }
}

// CountUp animasyonu
function animateCountUp(element, from, to, duration) {
    const startTime = performance.now();
    const difference = to - from;

    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = from + (difference * easeOut);

        element.textContent = Math.floor(currentValue);

        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }

    requestAnimationFrame(updateCount);
}
```

#### 2. **problems.html** - Problem Listesi
**Filtreleme Sistemi**:
```javascript
async function loadProblems(page = 0, filters = {}) {
    const params = new URLSearchParams({
        page: page,
        size: 15,
        sort: filters.sort || 'createdAt,desc'
    });

    if (filters.search) params.append('search', filters.search);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${API_URL}/problems?${params}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    const data = await response.json();
    renderProblems(data.content);
    renderPagination(data);
}
```

#### 3. **problem-detail.html** - Problem Detay
**Çözüm Formu**:
```javascript
function createEntryRow() {
    return `
        <tr class="entry-row">
            <td><input type="text" class="account-code" placeholder="Hesap Kodu"></td>
            <td><input type="text" class="account-name" placeholder="Hesap Adı"></td>
            <td><input type="number" class="debit" placeholder="0.00" step="0.01"></td>
            <td><input type="number" class="credit" placeholder="0.00" step="0.01"></td>
            <td><button onclick="removeRow(this)">Sil</button></td>
        </tr>
    `;
}

async function checkSolution() {
    const problemId = getProblemIdFromURL();
    const userId = JSON.parse(localStorage.getItem('user')).id;

    const userEntries = [];
    document.querySelectorAll('.entry-row').forEach(row => {
        userEntries.push({
            accountCode: row.querySelector('.account-code').value,
            accountName: row.querySelector('.account-name').value,
            debit: parseFloat(row.querySelector('.debit').value) || 0,
            credit: parseFloat(row.querySelector('.credit').value) || 0
        });
    });

    const response = await fetch(`${API_URL}/solved-problems/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            problemId,
            userId,
            userEntries
        })
    });

    const result = await response.json();
    showSolutionResult(result);
}
```

#### 4. **admin.html** - Admin Paneli
**Problem Ekleme Formu**:
```javascript
async function createProblem() {
    const problemData = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        hint: document.getElementById('hint').value,
        difficulty: document.getElementById('difficulty').value,
        tags: document.getElementById('tags').value,
        correctEntries: getCorrectEntriesFromForm()
    };

    const response = await fetch(`${API_URL}/admin/problems`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(problemData)
    });

    if (response.ok) {
        alert('Problem başarıyla eklendi!');
        loadProblems();
    }
}
```

---

## 🔐 GÜVENLİK VE YETKİLENDİRME

### Authentication Flow

```
1. Kullanıcı → POST /api/auth/login
   ↓
2. Backend: Username/Password kontrolü
   ↓
3. Backend: JWT Token oluştur
   ↓
4. Response: { token, id, username, role }
   ↓
5. Frontend: Token'ı localStorage'a kaydet
   ↓
6. Sonraki istekler: Authorization: Bearer <token>
   ↓
7. Backend: JwtRequestFilter token'ı validate eder
   ↓
8. Backend: SecurityContext'e authentication set eder
   ↓
9. Controller endpoint erişimi izin verilir
```

### Authorization Matrix

| Endpoint | Anonymous | USER | ADMIN |
|----------|-----------|------|-------|
| GET /api/problems | ✅ | ✅ | ✅ |
| POST /api/solved-problems/check | ✅ | ✅ | ✅ |
| GET /api/users/{id}/profile | ❌ | ✅ (kendi) | ✅ (hepsi) |
| GET /api/admin/users | ❌ | ❌ | ✅ |
| POST /api/admin/problems | ❌ | ❌ | ✅ |

### Password Security
- **Algoritma**: BCrypt
- **Salt**: Otomatik (BCrypt tarafından)
- **Rounds**: 10 (default)
- **Validation**: Min 4 karakter (dev), 8+ önerilir (prod)

---

## 🌐 API ENDPOINT'LERİ

### Authentication Endpoints

#### POST /api/auth/register
**Request**:
```json
{
  "username": "johndoe",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "role": "USER"
}
```

#### POST /api/auth/login
**Request**:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "role": "USER"
}
```

### Problem Endpoints

#### GET /api/problems
**Query Parameters**:
- `page` (int, default: 0)
- `size` (int, default: 15)
- `sort` (string[], default: ["createdAt", "desc"])
- `search` (string, optional)
- `difficulty` (string, optional): EASY, MEDIUM, HARD
- `status` (string, optional): solved, unsolved

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "title": "Stok Alımı",
      "content": "Firma 10.000 TL tutarında stok almıştır...",
      "difficulty": "EASY",
      "hint": "153 Ticari Mallar ve 100 Kasa hesaplarını kullanın",
      "tags": "stok,alım",
      "solved": false
    }
  ],
  "totalElements": 50,
  "totalPages": 4,
  "number": 0,
  "size": 15
}
```

#### POST /api/solved-problems/check
**Request**:
```json
{
  "problemId": 1,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "userEntries": [
    {
      "accountCode": "153",
      "accountName": "Ticari Mallar",
      "debit": 10000,
      "credit": 0
    },
    {
      "accountCode": "100",
      "accountName": "Kasa",
      "debit": 0,
      "credit": 10000
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "correct": true,
  "balanced": true,
  "earnedPoints": 10,
  "message": "Tebrikler! Çözümünüz doğru.",
  "correctEntries": [...]
}
```

### Admin Endpoints (ADMIN only)

#### POST /api/admin/problems
**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "title": "Maaş Ödemesi",
  "content": "Firma çalışanlarına 50.000 TL maaş ödemiştir...",
  "hint": "770 Genel Yönetim Giderleri ve 102 Bankalar",
  "difficulty": "MEDIUM",
  "tags": "maaş,ödeme",
  "correctEntries": [
    {
      "accountCode": "770",
      "accountName": "Genel Yönetim Giderleri",
      "debit": 50000,
      "credit": 0
    },
    {
      "accountCode": "102",
      "accountName": "Bankalar",
      "debit": 0,
      "credit": 50000
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "id": 51,
  "title": "Maaş Ödemesi",
  "difficulty": "MEDIUM",
  "createdAt": "2024-10-27T11:00:00"
}
```

---

## ✨ ÖZELLİKLER VE FONKSİYONLAR

### Kullanıcı Özellikleri

1. **Problem Çözme Sistemi**
   - Dinamik yevmiye kayıt tablosu
   - Borç-alacak dengesi kontrolü
   - Otomatik doğrulama
   - Puan kazanma
   - Çözüm geçmişi

2. **İlerleme Takibi**
   - Kişisel dashboard
   - Grafik görselleştirme
   - Günlük seri takibi
   - Rozet sistemi

3. **Profil Yönetimi**
   - Kişisel bilgiler
   - Profesyonel bilgiler
   - Şifre değiştirme
   - Tercihler

### Admin Özellikleri

1. **Problem Yönetimi**
   - CRUD işlemleri
   - Doğru kayıt tanımlama
   - Toplu işlemler

2. **Kullanıcı Yönetimi**
   - Kullanıcı listesi
   - Rol değiştirme
   - Kullanıcı detayları

3. **Raporlama**
   - Dashboard metrikleri
   - Detaylı raporlar
   - Grafik ve tablolar

---

## 👥 KULLANICI ROLLERİ

### USER (Normal Kullanıcı)
**Yetkiler**:
- ✅ Problem görüntüleme ve çözme
- ✅ Profil yönetimi
- ✅ Dashboard erişimi
- ❌ Problem ekleme/düzenleme
- ❌ Admin paneli

### ADMIN (Yönetici)
**Yetkiler**:
- ✅ Tüm USER yetkileri
- ✅ Problem CRUD
- ✅ Kullanıcı yönetimi
- ✅ Sistem istatistikleri
- ✅ Admin paneli

---

## 🔧 GELİŞTİRME NOTLARI

### Build ve Run
```bash
# Build
./mvnw clean install

# Run
./mvnw spring-boot:run

# Test
./mvnw test

# Package (test'siz)
./mvnw package -DskipTests
```

### Database Setup
```sql
CREATE DATABASE muhasebe_okulu;
CREATE USER postgres WITH PASSWORD '1234';
GRANT ALL PRIVILEGES ON DATABASE muhasebe_okulu TO postgres;
```

### API Test
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Actuator**: http://localhost:8080/actuator

### Common Issues

1. **CORS Hatası**: `SecurityConfig.java`'da origin ekle
2. **JWT Token Hatası**: Token süresini kontrol et
3. **Database Connection**: PostgreSQL servisinin çalıştığını doğrula
4. **Lombok**: Plugin ve annotation processing aktif olmalı

---

**Son Güncelleme**: 2024-10-27
**Dokümantasyon Versiyonu**: 2.0





