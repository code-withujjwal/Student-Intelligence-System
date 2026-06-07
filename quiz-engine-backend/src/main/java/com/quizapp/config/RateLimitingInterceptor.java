package com.quizapp.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = request.getRemoteAddr();
        TokenBucket bucket = buckets.computeIfAbsent(clientIp, k -> new TokenBucket(50, 50)); // 50 requests per minute

        if (!bucket.tryConsume()) {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("{\"success\": false, \"message\": \"Rate limit exceeded\", \"errorCode\": \"RATE_LIMIT\"}");
            response.setContentType("application/json");
            return false;
        }
        return true;
    }

    private static class TokenBucket {
        private final long capacity;
        private long tokens;
        private long lastRefillTime;
        private final long refillRateMs;

        public TokenBucket(long capacity, long refillRatePerMinute) {
            this.capacity = capacity;
            this.tokens = capacity;
            this.refillRateMs = 60000 / refillRatePerMinute;
            this.lastRefillTime = System.currentTimeMillis();
        }

        public synchronized boolean tryConsume() {
            long now = System.currentTimeMillis();
            long timePassed = now - lastRefillTime;
            long tokensToRefill = timePassed / refillRateMs;

            if (tokensToRefill > 0) {
                tokens = Math.min(capacity, tokens + tokensToRefill);
                lastRefillTime = now;
            }

            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }
    }
}
