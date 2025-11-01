// src/main/java/com/example/muhasebeokulu5/controller/AccountPlanController.java
package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.AccountPlanDTO;
import com.example.muhasebeokulu5.entities.AccountPlan;
import com.example.muhasebeokulu5.repository.AccountPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/account-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountPlanController {

    private final AccountPlanRepository accountPlanRepository;

    // Tüm aktif hesap planlarını getir
    @GetMapping
    public ResponseEntity<List<AccountPlanDTO>> getAllActive() {
        List<AccountPlan> accounts = accountPlanRepository.findAllActive();
        List<AccountPlanDTO> dtos = accounts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Kod ile hesap planı ara
    @GetMapping("/search")
    public ResponseEntity<AccountPlanDTO> searchByCode(@RequestParam String code) {
        return accountPlanRepository.findByCode(code)
                .map(account -> ResponseEntity.ok(toDTO(account)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Kod ile başlayan hesap planlarını getir (autocomplete için)
    @GetMapping("/autocomplete")
    public ResponseEntity<List<AccountPlanDTO>> autocomplete(@RequestParam String code) {
        List<AccountPlan> accounts = accountPlanRepository.findByCodeStartingWith(code);
        List<AccountPlanDTO> dtos = accounts.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private AccountPlanDTO toDTO(AccountPlan account) {
        return new AccountPlanDTO(
                account.getId(),
                account.getCode(),
                account.getName(),
                account.getDescription()
        );
    }
}