package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.ProblemDTO;
import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.entities.SolvedProblem;
import com.example.muhasebeokulu5.service.ProblemService;
import com.example.muhasebeokulu5.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:63342")
@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;
    private final ModelMapper modelMapper;
    private final UserService userService;

    public ProblemController(ProblemService problemService, ModelMapper modelMapper, UserService userService) {
        this.problemService = problemService;
        this.modelMapper = modelMapper;
        this.userService = userService;
    }

    // 🆕 Sayfalama ve filtreleme ile problemleri getir
    @GetMapping
    public ResponseEntity<Page<ProblemDTO>> getAllProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status
    ) {
        try {
            System.out.println("🔍 Filtreleme isteği alındı:");
            System.out.println("  - Search: " + search);
            System.out.println("  - Difficulty: " + difficulty);
            System.out.println("  - Status: " + status);
            System.out.println("  - Page: " + page + ", Size: " + size);
            System.out.println("  - Sort: " + sort[0] + ", " + sort[1]);
            
            Sort.Direction direction = Sort.Direction.fromString(sort[1]);
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));

            System.out.println("📥 Service çağrılıyor...");
            
            // Kullanıcı ID'sini al
            java.util.UUID userId = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                try {
                    userId = userService.getUserIdByUsername(auth.getName());
                    System.out.println("🔍 Kullanıcı: " + auth.getName() + " (ID: " + userId + ")");
                } catch (Exception e) {
                    System.err.println("❌ Kullanıcı ID alınamadı: " + e.getMessage());
                }
            }
            
            Page<ProblemDTO> problemDTOPage = problemService.getFilteredProblemsOptimized(pageable, search, difficulty, status, userId);
            
            System.out.println("✅ Service sonucu: " + problemDTOPage.getTotalElements() + " problem bulundu");
            
            return ResponseEntity.ok(problemDTOPage);
        } catch (Exception e) {
            System.err.println("❌ HATA: " + e.getClass().getName());
            System.err.println("❌ Mesaj: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblemById(@PathVariable Long id) {
        try {
            Problem problem = problemService.getProblemById(id);
            // Manuel mapping - ModelMapper'ı kullanmayalım
            ProblemDTO dto = new ProblemDTO();
            dto.setId(problem.getId());
            dto.setTitle(problem.getTitle());
            dto.setContent(problem.getContent());
            dto.setHint(problem.getHint());
            dto.setTags(problem.getTags());
            dto.setDifficulty(problem.getDifficulty());
            // Gerçek kullanıcı için çözüm durumunu kontrol et
            dto.setSolved(isProblemSolvedByUser(problem));
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("❌ Problem yükleme hatası: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Problem not found: " + e.getMessage());
        }
    }

    @PostMapping
    public ProblemDTO createProblem(@RequestBody Problem problem) {
        Problem saved = problemService.createProblem(problem);
        return modelMapper.map(saved, ProblemDTO.class);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProblem(@PathVariable Long id, @RequestBody Problem updated) {
        Problem existing = problemService.getProblemById(id);
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setHint(updated.getHint());
        existing.setTags(updated.getTags());
        problemService.createProblem(existing);
        return ResponseEntity.ok("Problem updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.ok("Problem deleted");
    }

    // Kullanıcının problemi çözüp çözmediğini kontrol et
    private boolean isProblemSolvedByUser(Problem problem) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                System.out.println("  ❌ Giriş yapmamış kullanıcı");
                return false; // Giriş yapmamış kullanıcı
            }
            
            // Giriş yapmış kullanıcının username'ini al
            String currentUsername = auth.getName();
            System.out.println("🔍 Kontrol ediliyor - Problem: " + problem.getId() + ", Kullanıcı: " + currentUsername);
            
            // Kullanıcının bu problemi çözüp çözmediğini kontrol et
            List<SolvedProblem> solvedProblems = problem.getSolvedProblems();
            System.out.println("  📊 SolvedProblems sayısı: " + (solvedProblems != null ? solvedProblems.size() : "null"));
            
            if (solvedProblems == null || solvedProblems.isEmpty()) {
                System.out.println("  ❌ Hiç çözüm yok");
                return false;
            }
            
            // Her solved problem'i kontrol et
            for (SolvedProblem sp : solvedProblems) {
                System.out.println("    - SolvedProblem User: " + (sp.getUser() != null ? sp.getUser().getUsername() : "null"));
                System.out.println("    - Current User: " + currentUsername);
                System.out.println("    - Match: " + (sp.getUser() != null && 
                                   sp.getUser().getUsername() != null && 
                                   sp.getUser().getUsername().equals(currentUsername)));
            }
            
            // GİRİŞ YAPMIŞ kullanıcının bu problemi çözüp çözmediğini kontrol et
            boolean isSolved = solvedProblems.stream()
                    .anyMatch(sp -> sp.getUser() != null && 
                                   sp.getUser().getUsername() != null && 
                                   sp.getUser().getUsername().equals(currentUsername));
            
            System.out.println("  " + (isSolved ? "✅ Çözülmüş" : "❌ Çözülmemiş"));
            return isSolved;
        } catch (Exception e) {
            System.err.println("Çözüm durumu kontrol hatası: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}