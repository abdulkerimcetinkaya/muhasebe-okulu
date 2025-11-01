package com.example.muhasebeokulu5.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryDTO {

    private Long id;
    private String name;
    private String description;
    private Integer displayOrder;
    private Long problemCount; // Kategorideki problem sayısı
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
