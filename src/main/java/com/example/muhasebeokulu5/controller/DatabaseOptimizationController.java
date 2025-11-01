package com.example.muhasebeokulu5.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class DatabaseOptimizationController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeDatabaseOptimization() {
        System.out.println("🚀 Starting database optimization...");
        optimizeDatabase();
        System.out.println("📊 Creating materialized views...");
        createMaterializedViews();
    }

    @PostMapping("/optimize-database")
    public String optimizeDatabase() {
        try {
            // SQL dosyasını oku
            String sql = new String(Files.readAllBytes(Paths.get("src/main/resources/db/migration/V2__add_performance_indexes.sql")));
            
            // SQL'i satırlara böl ve çalıştır
            String[] statements = sql.split(";");
            
            for (String statement : statements) {
                statement = statement.trim();
                if (!statement.isEmpty() && !statement.startsWith("--")) {
                    try {
                        jdbcTemplate.execute(statement);
                        System.out.println("Executed: " + statement.substring(0, Math.min(50, statement.length())) + "...");
                    } catch (Exception e) {
                        System.err.println("Error executing: " + statement.substring(0, Math.min(50, statement.length())) + "...");
                        System.err.println("Error: " + e.getMessage());
                    }
                }
            }
            
            return "Database optimization completed successfully!";
            
        } catch (IOException e) {
            return "Error reading SQL file: " + e.getMessage();
        } catch (Exception e) {
            return "Error during optimization: " + e.getMessage();
        }
    }

    public String createMaterializedViews() {
        try {
            // Materialized views SQL dosyasını oku
            String sql = new String(Files.readAllBytes(Paths.get("src/main/resources/db/migration/V3__add_materialized_views.sql")));
            
            // SQL'i satırlara böl ve çalıştır
            String[] statements = sql.split(";");
            
            for (String statement : statements) {
                statement = statement.trim();
                if (!statement.isEmpty() && !statement.startsWith("--")) {
                    try {
                        jdbcTemplate.execute(statement);
                        System.out.println("✅ Executed: " + statement.substring(0, Math.min(50, statement.length())) + "...");
                    } catch (Exception e) {
                        System.err.println("❌ Error executing: " + statement.substring(0, Math.min(50, statement.length())) + "...");
                        System.err.println("Error: " + e.getMessage());
                    }
                }
            }
            
            return "Materialized views created successfully!";
            
        } catch (IOException e) {
            return "Error reading SQL file: " + e.getMessage();
        } catch (Exception e) {
            return "Error during materialized view creation: " + e.getMessage();
        }
    }
}
