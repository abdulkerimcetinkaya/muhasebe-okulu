// src/main/java/com/example/muhasebeokulu5/dto/AccountPlanDTO.java
package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountPlanDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
}