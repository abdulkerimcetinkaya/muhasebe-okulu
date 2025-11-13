package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.ProblemDTO;
import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.entities.SolvedProblem;
import com.example.muhasebeokulu5.service.ProblemService;
import com.example.muhasebeokulu5.service.UserService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(ProblemController.class);

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
            log.debug("Filtreleme isteği alındı: search={}, difficulty={}, status={}, page={}, size={}, sort={},{}",
                     search, difficulty, status, page, size, sort[0], sort[1]);

            Sort.Direction direction = Sort.Direction.fromString(sort[1]);
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));

            log.debug("Service çağrılıyor...");

            // Kullanıcı ID'sini al
            java.util.UUID userId = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                try {
                    userId = userService.getUserIdByUsername(auth.getName());
                    log.debug("Kullanıcı: {} (ID: {})", auth.getName(), userId);
                } catch (Exception e) {
                    log.error("Kullanıcı ID alınamadı", e);
                }
            }

            Page<ProblemDTO> problemDTOPage = problemService.getFilteredProblemsOptimized(pageable, search, difficulty, status, userId);

            log.debug("Service sonucu: {} problem bulundu", problemDTOPage.getTotalElements());

            return ResponseEntity.ok(problemDTOPage);
        } catch (Exception e) {
            log.error("Problem filtreleme hatası", e);
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
            log.error("Problem yükleme hatası: {}", id, e);
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
                log.debug("Giriş yapmamış kullanıcı için çözüm kontrolü");
                return false; // Giriş yapmamış kullanıcı
            }

            // Giriş yapmış kullanıcının username'ini al
            String currentUsername = auth.getName();
            log.debug("Problem çözüm kontrolü - Problem ID: {}, Kullanıcı: {}", problem.getId(), currentUsername);

            // Kullanıcının bu problemi çözüp çözmediğini kontrol et
            List<SolvedProblem> solvedProblems = problem.getSolvedProblems();
            log.debug("SolvedProblems sayısı: {}", solvedProblems != null ? solvedProblems.size() : "null");

            if (solvedProblems == null || solvedProblems.isEmpty()) {
                log.debug("Problem henüz çözülmemiş");
                return false;
            }

            // GİRİŞ YAPMIŞ kullanıcının bu problemi çözüp çözmediğini kontrol et
            boolean isSolved = solvedProblems.stream()
                    .anyMatch(sp -> sp.getUser() != null &&
                                   sp.getUser().getUsername() != null &&
                                   sp.getUser().getUsername().equals(currentUsername));

            log.debug("Problem çözüm durumu: {}", isSolved ? "Çözülmüş" : "Çözülmemiş");
            return isSolved;
        } catch (Exception e) {
            log.error("Çözüm durumu kontrol hatası", e);
            return false;
        }
    }
}