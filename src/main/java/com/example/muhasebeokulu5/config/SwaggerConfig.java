package com.example.muhasebeokulu5.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI accountingPlatformAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Accounting Learning Platform API")
                        .description("LeetCode tarzı muhasebe öğrenme platformu için REST API dokümantasyonu.")
                        .version("1.0.0"));
    }
}

