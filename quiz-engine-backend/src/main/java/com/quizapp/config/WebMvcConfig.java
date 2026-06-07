package com.quizapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final RateLimitingInterceptor rateLimitingInterceptor;
    private final RequestLoggingInterceptor requestLoggingInterceptor;

    public WebMvcConfig(RateLimitingInterceptor rateLimitingInterceptor, RequestLoggingInterceptor requestLoggingInterceptor) {
        this.rateLimitingInterceptor = rateLimitingInterceptor;
        this.requestLoggingInterceptor = requestLoggingInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply to all API endpoints
        registry.addInterceptor(requestLoggingInterceptor).addPathPatterns("/api/**");
        registry.addInterceptor(rateLimitingInterceptor).addPathPatterns("/api/**");
    }
}
