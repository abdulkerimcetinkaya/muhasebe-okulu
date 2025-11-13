package com.example.muhasebeokulu5.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    name = "database.constraint.updater.enabled",
    havingValue = "true",
    matchIfMissing = true
)
public class DatabaseConstraintUpdater {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseConstraintUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void updateRoleConstraint() {
        try {
            // Mevcut constraint'i kaldır
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            
            // Yeni constraint'i TEACHER rolü ile ekle
            jdbcTemplate.execute("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'TEACHER', 'ADMIN'))");
            
            System.out.println("✅ Role constraint successfully updated with TEACHER role!");
        } catch (Exception e) {
            System.err.println("⚠️  Warning: Could not update role constraint. It might already be correct.");
            System.err.println("Error: " + e.getMessage());
        }
    }
}



