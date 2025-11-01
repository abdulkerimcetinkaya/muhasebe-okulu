package com.example.muhasebeokulu5;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example.muhasebeokulu5")
public class MuhasebeOkulu5Application {

    public static void main(String[] args) {
        SpringApplication.run(MuhasebeOkulu5Application.class, args);
    }

}
