package com.example.muhasebeokulu5.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.mockito.Mockito.mock;

@TestConfiguration
public class TestConfiguration {

    /**
     * Provide a mock JdbcTemplate for tests that need DatabaseConstraintUpdater
     */
    @Bean
    public JdbcTemplate jdbcTemplate() {
        return mock(JdbcTemplate.class);
    }
}
