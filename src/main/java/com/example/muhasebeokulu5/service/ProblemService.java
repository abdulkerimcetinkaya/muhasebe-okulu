package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.entities.Difficulty;
import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.dto.ProblemDTO;
import com.example.muhasebeokulu5.exception.ResourceNotFoundException;
import com.example.muhasebeokulu5.exception.BadRequestException;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public List<Problem> getAllProblems() {
        try {
            return problemRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Problemler listelenirken hata oluştu: " + e.getMessage(), e);
        }
    }

    public Problem getProblemById(Long id) {
        try {
            if (id == null) {
                throw new BadRequestException("Problem ID boş olamaz");
            }
            return problemRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Problem bulunamadı (ID: " + id + ")"));
        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Problem getirilirken hata oluştu: " + e.getMessage(), e);
        }
    }

    public Problem createProblem(Problem problem) {
        try {
            if (problem.getTitle() == null || problem.getTitle().trim().isEmpty()) {
                throw new BadRequestException("Problem başlığı boş olamaz");
            }
            if (problem.getContent() == null || problem.getContent().trim().isEmpty()) {
                throw new BadRequestException("Problem içeriği boş olamaz");
            }
            return problemRepository.save(problem);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Problem oluşturulurken hata oluştu: " + e.getMessage(), e);
        }
    }

    public void deleteProblem(Long id) {
        try {
            if (id == null) {
                throw new BadRequestException("Problem ID boş olamaz");
            }
            if (!problemRepository.existsById(id)) {
                throw new ResourceNotFoundException("Silinecek problem bulunamadı (ID: " + id + ")");
            }
            problemRepository.deleteById(id);
        } catch (ResourceNotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Problem silinirken hata oluştu: " + e.getMessage(), e);
        }
    }

    // YENİ: Sayfalama desteği
    public Page<Problem> getAllProblemsPage(Pageable pageable) {
        return problemRepository.findAll(pageable);
    }
    
    // YENİ: Filtreleme ve sayfalama desteği
    public Page<Problem> getFilteredProblems(Pageable pageable, String search, String difficulty, String status) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasDifficulty = difficulty != null && !difficulty.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();
        
        // Status filtreleme için kullanıcı ID'si gerekli
        // Bu metod artık kullanıcı ID'si parametresi almalı
        // Şimdilik tüm problemleri döndür, controller'da kullanıcı ID'si ile çağırılacak
        return getFilteredProblemsByUser(pageable, search, difficulty, status, null);
    }
    
    // YENİ: Optimized version - N+1 query problemini önler
    public Page<ProblemDTO> getFilteredProblemsOptimized(Pageable pageable, String search, String difficulty, String status, java.util.UUID userId) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasDifficulty = difficulty != null && !difficulty.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();
        
        Page<Problem> problemPage;
        
        // Kullanıcı ID'si yoksa tüm problemleri döndür
        if (userId == null) {
            problemPage = getFilteredProblemsWithoutUser(pageable, search, difficulty);
        } else {
            // Kullanıcı ID'si varsa status filtreleme yap
            if (hasStatus) {
                if (status.equals("solved")) {
                    // Çözülmüş problemler
                    if (!hasSearch && !hasDifficulty) {
                        problemPage = problemRepository.findSolvedProblemsByUser(userId, pageable);
                    } else if (!hasSearch && hasDifficulty) {
                        problemPage = problemRepository.findSolvedProblemsByUserAndDifficulty(userId, com.example.muhasebeokulu5.entities.Difficulty.valueOf(difficulty.toUpperCase()), pageable);
                    } else if (hasSearch && !hasDifficulty) {
                        problemPage = problemRepository.findSolvedProblemsByUserAndSearch(userId, search, pageable);
                    } else {
                        problemPage = problemRepository.findSolvedProblemsByUserAndDifficultyAndSearch(userId, com.example.muhasebeokulu5.entities.Difficulty.valueOf(difficulty.toUpperCase()), search, pageable);
                    }
                } else if (status.equals("unsolved")) {
                    // Çözülmemiş problemler
                    if (!hasSearch && !hasDifficulty) {
                        problemPage = problemRepository.findUnsolvedProblemsByUser(userId, pageable);
                    } else if (!hasSearch && hasDifficulty) {
                        problemPage = problemRepository.findUnsolvedProblemsByUserAndDifficulty(userId, com.example.muhasebeokulu5.entities.Difficulty.valueOf(difficulty.toUpperCase()), pageable);
                    } else if (hasSearch && !hasDifficulty) {
                        problemPage = problemRepository.findUnsolvedProblemsByUserAndSearch(userId, search, pageable);
                    } else {
                        problemPage = problemRepository.findUnsolvedProblemsByUserAndDifficultyAndSearch(userId, com.example.muhasebeokulu5.entities.Difficulty.valueOf(difficulty.toUpperCase()), search, pageable);
                    }
                } else {
                    // Geçersiz status, tüm problemleri döndür
                    problemPage = getFilteredProblemsWithoutUser(pageable, search, difficulty);
                }
            } else {
                // Status filtreleme yok, diğer filtreleri uygula
                problemPage = getFilteredProblemsWithoutUser(pageable, search, difficulty);
            }
        }
        
        // Sadece temel alanları döndür (N+1 query problemini önle)
        return problemPage.map(problem -> {
            ProblemDTO dto = new ProblemDTO();
            dto.setId(problem.getId());
            dto.setTitle(problem.getTitle());
            dto.setContent(problem.getContent());
            dto.setHint(problem.getHint());
            dto.setTags(problem.getTags());
            dto.setDifficulty(problem.getDifficulty());
            dto.setCreatedAt(problem.getCreatedAt());
            
            // Kullanıcının bu problemi çözüp çözmediğini kontrol et
            if (userId != null) {
                boolean isSolved = problem.getSolvedProblems() != null && 
                    problem.getSolvedProblems().stream()
                        .anyMatch(sp -> sp.getUser() != null && sp.getUser().getId().equals(userId));
                dto.setSolved(isSolved);
            } else {
                dto.setSolved(null); // Giriş yapmamış kullanıcı için null
            }
            
            // İstatistikleri 0 olarak ayarla (ayrı endpoint'te hesaplanabilir)
            dto.setSolveCount(0L);
            dto.setSuccessRate(0.0);
            dto.setCorrectEntries(new ArrayList<>());
            
            return dto;
        });
    }

    // YENİ: Kullanıcı ID'si ile filtreleme
    public Page<Problem> getFilteredProblemsByUser(Pageable pageable, String search, String difficulty, String status, java.util.UUID userId) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasDifficulty = difficulty != null && !difficulty.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();
        
        // Kullanıcı ID'si yoksa tüm problemleri döndür
        if (userId == null) {
            return getFilteredProblemsWithoutUser(pageable, search, difficulty);
        }
        
        // Status filtreleme var
        if (hasStatus) {
            try {
                com.example.muhasebeokulu5.entities.Difficulty difficultyEnum = null;
                if (hasDifficulty) {
                    difficultyEnum = com.example.muhasebeokulu5.entities.Difficulty.valueOf(difficulty.toUpperCase());
                }
                
                if (status.equals("solved")) {
                    // Çözülmüş problemler
                    if (!hasSearch && !hasDifficulty) {
                        return problemRepository.findSolvedProblemsByUser(userId, pageable);
                    } else if (!hasSearch && hasDifficulty) {
                        return problemRepository.findSolvedProblemsByUserAndDifficulty(userId, difficultyEnum, pageable);
                    } else if (hasSearch && !hasDifficulty) {
                        return problemRepository.findSolvedProblemsByUserAndSearch(userId, search, pageable);
                    } else {
                        return problemRepository.findSolvedProblemsByUserAndDifficultyAndSearch(userId, difficultyEnum, search, pageable);
                    }
                } else if (status.equals("unsolved")) {
                    // Çözülmemiş problemler
                    if (!hasSearch && !hasDifficulty) {
                        return problemRepository.findUnsolvedProblemsByUser(userId, pageable);
                    } else if (!hasSearch && hasDifficulty) {
                        return problemRepository.findUnsolvedProblemsByUserAndDifficulty(userId, difficultyEnum, pageable);
                    } else if (hasSearch && !hasDifficulty) {
                        return problemRepository.findUnsolvedProblemsByUserAndSearch(userId, search, pageable);
                    } else {
                        return problemRepository.findUnsolvedProblemsByUserAndDifficultyAndSearch(userId, difficultyEnum, search, pageable);
                    }
                }
            } catch (IllegalArgumentException e) {
                // Geçersiz difficulty değeri, tüm problemleri döndür
            return problemRepository.findAll(pageable);
        }
        }
        
        // Status filtreleme yok, diğer filtreleri uygula
        return getFilteredProblemsWithoutUser(pageable, search, difficulty);
    }
    
    // Status filtreleme olmadan filtreleme - EntityGraph ile solvedProblems yükle
    private Page<Problem> getFilteredProblemsWithoutUser(Pageable pageable, String search, String difficulty) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasDifficulty = difficulty != null && !difficulty.trim().isEmpty();
        
        // Hiç filtre yoksa tüm problemleri döndür
        if (!hasSearch && !hasDifficulty) {
            return problemRepository.findAllWithSolvedProblems(pageable);
        }
        
        // Sadece zorluk filtresi
        if (!hasSearch && hasDifficulty) {
            try {
                com.example.muhasebeokulu5.entities.Difficulty difficultyEnum = 
                    com.example.muhasebeokulu5.entities.Difficulty.valueOf(difficulty.toUpperCase());
                return problemRepository.findByDifficultyWithSolvedProblems(difficultyEnum, pageable);
            } catch (IllegalArgumentException e) {
                return problemRepository.findAllWithSolvedProblems(pageable);
            }
        }
        
        // Sadece arama filtresi
        if (hasSearch && !hasDifficulty) {
            return problemRepository.searchProblemsWithSolvedProblems(search, pageable);
        }
        
        // Her iki filtre de var
        try {
            com.example.muhasebeokulu5.entities.Difficulty difficultyEnum = 
                com.example.muhasebeokulu5.entities.Difficulty.valueOf(difficulty.toUpperCase());
            return problemRepository.searchProblemsByDifficultyWithSolvedProblems(search, difficultyEnum, pageable);
        } catch (IllegalArgumentException e) {
            return problemRepository.searchProblemsWithSolvedProblems(search, pageable);
        }
    }
}