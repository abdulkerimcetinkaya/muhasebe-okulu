package com.example.muhasebeokulu5.entities;

public enum Difficulty {
    EASY(10),    // Kolay: 10 puan
    MEDIUM(20),  // Orta: 20 puan
    HARD(30);    // Zor: 30 puan

    private final int points;

    Difficulty(int points) {
        this.points = points;
    }

    public int getPoints() {
        return points;
    }
}