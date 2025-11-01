package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.*;
import com.example.muhasebeokulu5.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // Kullanıcı Yönetimi
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserManagementDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        Page<UserManagementDTO> users = adminService.getAllUsers(page, size, search, role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserManagementDTO> getUserById(@PathVariable UUID id) {
        UserManagementDTO user = adminService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserManagementDTO> updateUserRole(@PathVariable UUID id, @RequestParam String role) {
        UserManagementDTO user = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Problem Yönetimi
    @GetMapping("/problems")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ProblemManagementDTO>> getAllProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String difficulty) {
        Page<ProblemManagementDTO> problems = adminService.getAllProblemsOptimized(page, size, search, difficulty);
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/problems/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemManagementDTO> getProblemById(@PathVariable Long id) {
        ProblemManagementDTO problem = adminService.getProblemById(id);
        return ResponseEntity.ok(problem);
    }

    @PostMapping("/problems")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemManagementDTO> createProblem(@RequestBody CreateProblemDTO createProblemDTO) {
        ProblemManagementDTO problem = adminService.createProblem(createProblemDTO);
        return ResponseEntity.ok(problem);
    }

    @PutMapping("/problems/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemManagementDTO> updateProblem(@PathVariable Long id, @RequestBody CreateProblemDTO updateProblemDTO) {
        ProblemManagementDTO problem = adminService.updateProblem(id, updateProblemDTO);
        return ResponseEntity.ok(problem);
    }

    @DeleteMapping("/problems/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        adminService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }

    // Raporlar
    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportDTO> getReports() {
        ReportDTO reports = adminService.getReports();
        return ResponseEntity.ok(reports);
    }
}