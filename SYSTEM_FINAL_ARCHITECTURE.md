# Enterprise Quiz LMS: Final System Architecture

This document serves as the definitive reference for the fully hardened, distributed, and AI-powered Adaptive Quiz Platform.

## 1. High-Level Architecture

```mermaid
graph TD
    Client[React Frontend + Zustand] --> |HTTPS / JWT| NGINX[Gateway / Load Balancer]
    Client --> |WSS STOMP| NGINX
    
    NGINX --> Backend[Spring Boot Monolith Node]
    
    Backend --> |JPA + @Filter| MySQL[(MySQL Database - Multi-Tenant)]
    Backend --> |@Cacheable TTL| Redis[(Redis Cache)]
    Backend --> |STOMP Relay| RabbitMQ[(RabbitMQ Broker)]
    Backend --> |WebFlux Non-Blocking| AI[Gemini / OpenAI API]
```

## 2. Core Subsystems

### A. AI Adaptive Engine
- **WebFlux Isolation**: The React frontend **never** exposes the LLM API key. React calls the Spring Boot `/api/ai/*` endpoints. Spring Boot leverages the non-blocking `WebClient` to query the Gemini API, enforcing a strict 10-second timeout to prevent thread starvation.
- **Cost-Controlled Caching**: AI explanations are cached in Redis with a 7-day TTL (`@Cacheable(value="explanations", key="#question + '-' + #userAnswer")`). If a question stumps 10,000 students, the system only pays for the API call *once*.

### B. Scalable Real-Time Engine (The 10k User Problem)
- **Problem**: Spring's default `SimpleBroker` tracks WebSockets in RAM. If you load balance across 5 backend nodes, User A on Node 1 cannot see leaderboard events from User B on Node 2.
- **Solution**: We bypassed the `SimpleBroker` and wired a **STOMP Broker Relay** directly to an external RabbitMQ cluster. Node 1 publishes the event to RabbitMQ, which instantly fans it out to Nodes 2, 3, 4, and 5. All 10,000 users see the live leaderboard update instantaneously.

### C. True Multi-Tenant Isolation
- **Discriminator Pattern**: To avoid the massive overhead of provisioning separate databases per organization, we utilized a Shared DB / Shared Schema pattern.
- **Hibernate Aspect Injection**: Every incoming request passes through the `TenantFilter` which extracts the `tenantId` from the JWT. The `TenantAspect` automatically injects `WHERE tenant_id = ?` into *every single* JPA query executed. Cross-tenant data leakage is mathematically impossible at the ORM layer.

### D. Production Reliability (Resilience)
- **Token Rotation**: The frontend utilizes an Axios Interceptor that catches `401 Unauthorized` responses. It pauses the request queue, hits the `/refresh` endpoint with the 7-day refresh token, updates localStorage, and replays the original requests transparently.
- **Token Bucket Rate Limiting**: The `RateLimitingInterceptor` guards all endpoints (50 requests/min per IP) to prevent scraping and abuse.
- **SLA Observability**: The `RequestLoggingInterceptor` tracks the latency of every API call, triggering `WARN` logs for anything over 500ms.
