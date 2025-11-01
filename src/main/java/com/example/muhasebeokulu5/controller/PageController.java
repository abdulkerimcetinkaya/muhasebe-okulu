package com.example.muhasebeokulu5.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "forward:/pages/index.html";
    }
    
    @GetMapping("/home")
    public String home() {
        return "forward:/pages/index.html";
    }
    
    @GetMapping("/problems")
    public String problems() {
        return "forward:/pages/problems.html";
    }
    
    @GetMapping("/profile")
    public String profile() {
        return "forward:/pages/profile.html";
    }
    
    @GetMapping("/login")
    public String login() {
        return "forward:/pages/login.html";
    }
    
    @GetMapping("/register")
    public String register() {
        return "forward:/pages/register.html";
    }
    
    @GetMapping("/admin")
    public String admin() {
        return "forward:/pages/admin.html";
    }
    
    @GetMapping("/dashboard")
    public String dashboard() {
        return "forward:/pages/dashboard.html";
    }
    
    @GetMapping("/admin-dashboard")
    public String adminDashboard() {
        return "forward:/pages/admin-dashboard.html";
    }
}

