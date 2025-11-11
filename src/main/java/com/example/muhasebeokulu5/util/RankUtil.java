package com.example.muhasebeokulu5.util;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Yıldız sistemi için unvan hesaplama utility sınıfı
 * HackerRank tarzı yıldız + unvan sistemi
 */
public class RankUtil {

    /**
     * Unvan bilgisi
     */
    @Data
    @AllArgsConstructor
    public static class RankInfo {
        private String rankName;    // Unvan adı (Türkçe)
        private String rankIcon;    // Unvan ikonu (emoji)
        private String rankColor;   // Unvan rengi (Tailwind class)
        private int minStars;       // Minimum yıldız
        private Integer maxStars;   // Maximum yıldız (null = sınırsız)
        private int level;          // Seviye (1-7)
        private int progress;       // Bir sonraki seviyeye ilerleme % (0-100)
        private Integer starsToNext; // Bir sonraki seviyeye kalan yıldız (null = maksimum seviye)
    }

    // Unvan threshold'ları (Her 500 puan = 1 yıldız için ayarlandı)
    private static final RankInfo[] RANKS = {
        new RankInfo("Başlangıç", "🌱", "slate", 0, 2, 1, 0, null),        // 0-1000 puan
        new RankInfo("Öğrenci", "⭐", "blue", 3, 7, 2, 0, null),           // 1500-3500 puan
        new RankInfo("Geliştiren", "🔷", "cyan", 8, 15, 3, 0, null),      // 4000-7500 puan
        new RankInfo("Uzman", "💎", "purple", 16, 30, 4, 0, null),        // 8000-15000 puan
        new RankInfo("Usta", "👑", "yellow", 31, 50, 5, 0, null),         // 15500-25000 puan
        new RankInfo("Efsane", "⚡", "orange", 51, 75, 6, 0, null),       // 25500-37500 puan
        new RankInfo("Titan", "🏆", "red", 76, null, 7, 0, null)          // 38000+ puan
    };

    /**
     * Yıldız sayısına göre unvan bilgisini döndürür
     *
     * @param totalStars Kullanıcının toplam yıldız sayısı
     * @return RankInfo object
     */
    public static RankInfo getRankInfo(int totalStars) {
        RankInfo currentRank = RANKS[0]; // Default: Başlangıç

        // Kullanıcının unvanını bul
        for (RankInfo rank : RANKS) {
            if (totalStars >= rank.getMinStars()) {
                if (rank.getMaxStars() == null || totalStars <= rank.getMaxStars()) {
                    currentRank = new RankInfo(
                        rank.getRankName(),
                        rank.getRankIcon(),
                        rank.getRankColor(),
                        rank.getMinStars(),
                        rank.getMaxStars(),
                        rank.getLevel(),
                        0, // progress - aşağıda hesaplanacak
                        null // starsToNext - aşağıda hesaplanacak
                    );
                    break;
                }
            }
        }

        // İlerleme hesapla
        if (currentRank.getMaxStars() != null) {
            int rangeSize = currentRank.getMaxStars() - currentRank.getMinStars() + 1;
            int currentProgress = totalStars - currentRank.getMinStars();
            int progressPercent = (int) ((currentProgress * 100.0) / rangeSize);
            currentRank.setProgress(Math.min(100, Math.max(0, progressPercent)));

            int starsToNext = currentRank.getMaxStars() - totalStars + 1;
            currentRank.setStarsToNext(Math.max(0, starsToNext));
        } else {
            // Maksimum seviye
            currentRank.setProgress(100);
            currentRank.setStarsToNext(null);
        }

        return currentRank;
    }

    /**
     * Kazanılan puanlara göre yıldız sayısını döndürür
     * Her 500 puan = 1 yıldız (yıldızları değerli ve kazanılması zor yapmak için)
     *
     * @param points Kazanılan puan
     * @return Yıldız sayısı
     */
    public static int getStarsForPoints(int points) {
        if (points <= 0) return 0;
        return points / 500; // Her 500 puan için 1 yıldız
    }

    /**
     * Problem zorluğuna göre yıldız sayısını döndürür
     * @deprecated Artık puan bazlı hesaplama kullanılıyor (getStarsForPoints)
     *
     * @param difficulty Problem zorluğu
     * @return Yıldız sayısı
     */
    @Deprecated
    public static int getStarsForDifficulty(String difficulty) {
        if (difficulty == null) return 1;

        return switch (difficulty.toUpperCase()) {
            case "KOLAY", "EASY" -> 1;
            case "ORTA", "MEDIUM" -> 2;
            case "ZOR", "HARD" -> 3;
            default -> 1;
        };
    }

    /**
     * İlk denemede doğru çözüm için bonus yıldız
     */
    public static int getFirstTryBonus() {
        return 1;
    }

    /**
     * Quiz tamamlama için yıldız
     */
    public static int getQuizCompletionStars() {
        return 1;
    }

    /**
     * Streak bonusu hesapla
     * Her 7 günlük seri için 1 bonus yıldız
     *
     * @param currentStreak Mevcut seri
     * @return Bonus yıldız sayısı
     */
    public static int getStreakBonus(int currentStreak) {
        if (currentStreak < 7) return 0;
        return currentStreak / 7; // Her 7 gün için 1 yıldız
    }

    /**
     * Tüm unvan bilgilerini döndürür (leaderboard vb için)
     */
    public static RankInfo[] getAllRanks() {
        return RANKS.clone();
    }

    /**
     * Seviyeye göre unvan bilgisi döndürür
     *
     * @param level Seviye (1-7)
     * @return RankInfo veya null
     */
    public static RankInfo getRankByLevel(int level) {
        for (RankInfo rank : RANKS) {
            if (rank.getLevel() == level) {
                return new RankInfo(
                    rank.getRankName(),
                    rank.getRankIcon(),
                    rank.getRankColor(),
                    rank.getMinStars(),
                    rank.getMaxStars(),
                    rank.getLevel(),
                    0,
                    null
                );
            }
        }
        return null;
    }

    /**
     * Yıldız sayısına göre Tailwind renk sınıfları döndürür
     *
     * @param color Renk adı
     * @return Tailwind CSS sınıfları
     */
    public static String getTailwindColorClasses(String color) {
        return switch (color) {
            case "slate" -> "bg-slate-100 text-slate-700 border-slate-200";
            case "blue" -> "bg-blue-100 text-blue-700 border-blue-200";
            case "cyan" -> "bg-cyan-100 text-cyan-700 border-cyan-200";
            case "purple" -> "bg-purple-100 text-purple-700 border-purple-200";
            case "yellow" -> "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "orange" -> "bg-orange-100 text-orange-700 border-orange-200";
            case "red" -> "bg-red-100 text-red-700 border-red-200";
            default -> "bg-gray-100 text-gray-700 border-gray-200";
        };
    }
}
