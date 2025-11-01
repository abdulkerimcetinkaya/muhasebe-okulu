package com.example.muhasebeokulu5.dto;

import com.example.muhasebeokulu5.entities.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDTO {
    private UUID id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Integer totalScore;
    private Integer solvedCount;
    private LocalDateTime createdAt;
    private LocalDate lastActiveDate;
    private Boolean isActive;
    private String status; // "ACTIVE", "INACTIVE", "BANNED"
}
