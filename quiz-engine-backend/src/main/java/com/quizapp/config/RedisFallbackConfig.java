package com.quizapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.RedisConnectionFailureException;

@Configuration
@EnableCaching
public class RedisFallbackConfig implements CachingConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(RedisFallbackConfig.class);

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                handleException(exception);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                handleException(exception);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                handleException(exception);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                handleException(exception);
            }

            private void handleException(RuntimeException exception) {
                logger.warn("Cache error occurred (likely Redis is down). Falling back to database execution. Error: {}", exception.getMessage());
            }
        };
    }
}
