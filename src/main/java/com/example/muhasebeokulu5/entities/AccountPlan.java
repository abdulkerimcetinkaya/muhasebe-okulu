// src/main/java/com/example/muhasebeokulu5/entities/AccountPlan.java
package com.example.muhasebeokulu5.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "account_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code; // "100", "102", vb.

    @Column(nullable = false, length = 255)
    private String name; // "Kasa", "Bankalar", vb.

    @Column(length = 500)
    private String description; // Açıklama (opsiyonel)

    @Column(nullable = false)
    private Boolean active = true; // Aktif/Pasif durum
}