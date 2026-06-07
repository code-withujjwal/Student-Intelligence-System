package com.quizapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

// Exclude Redis auto-configurations so the app starts even without a local Redis server.
// Refresh tokens are stored in MySQL (user_sessions table), not Redis.
// @EnableCaching will fall back to in-memory ConcurrentHashMap cache.
@SpringBootApplication(exclude = {
    RedisAutoConfiguration.class,
    RedisRepositoriesAutoConfiguration.class,
    RedisReactiveAutoConfiguration.class
})
@EnableScheduling
@org.springframework.cache.annotation.EnableCaching
public class QuizEngineApplication {

    public static void main(String[] args) {
        loadDotEnvLocal();
        SpringApplication.run(QuizEngineApplication.class, args);
    }

    private static void loadDotEnvLocal() {
        try {
            java.nio.file.Path envFile = java.nio.file.Paths.get("..", ".env.local");
            if (java.nio.file.Files.exists(envFile)) {
                java.util.List<String> lines = java.nio.file.Files.readAllLines(envFile);
                for (String line : lines) {
                    if (line.trim().isEmpty() || line.startsWith("#")) continue;
                    String[] parts = line.split("=", 2);
                    if (parts.length == 2) {
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        System.setProperty(key, value);

                        // Map VITE_GEMINI_API_KEY to GEMINI_API_KEY for Spring
                        if (key.equals("VITE_GEMINI_API_KEY")) {
                            System.setProperty("GEMINI_API_KEY", value);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to load .env.local: " + e.getMessage());
        }
    }
}