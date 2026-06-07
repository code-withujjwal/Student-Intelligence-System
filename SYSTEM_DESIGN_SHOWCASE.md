# LMS Quiz Engine: System Design Showcase

Welcome to the architectural deep dive of the Enterprise LMS Platform. This document is intended for technical reviewers, Engineering Managers, and Staff Engineers to evaluate the design decisions and scalability limits of the system.

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    Client[React Frontend + Zustand] --> |HTTPS / API Calls| NGINX[NGINX Reverse Proxy / Gateway]
    Client --> |WSS STOMP| NGINX
    
    NGINX --> |Rate-Limited Traffic| Backend[Spring Boot Monolith Node]
    
    Backend --> |JPA/Hibernate| MySQL[(MySQL Database)]
    Backend --> |@Cacheable / Sessions| Redis[(Redis Cache)]
    Backend --> |STOMP Relay| RabbitMQ[(RabbitMQ Message Broker)]
    
    subgraph Data Layer
        MySQL
        Redis
    end
    
    subgraph Event Layer
        RabbitMQ
    end
```

## 2. Request Lifecycle: Adaptive Quiz Generation
The Adaptive AI engine relies on the intersection of three domains:
1. **Client Request**: User clicks "Start Adaptive Quiz". Request hits `AdaptiveLearningController.java`.
2. **Profile Resolution**: `StudentProfileService` fetches the `StudentProfileEntity` which aggregates the student's known `weakAreas` from overnight behavior analysis.
3. **Database Query**: `AdaptiveQuizService` issues a query to the `quiz_db` filtering for `QuestionEntity` records where the `topic` matches the highest priority `weakAreas`.
4. **Caching**: If this is a heavily requested topic, the question bank subset is pulled directly from Redis to eliminate the MySQL hit.
5. **Response Delivery**: The dynamic JSON payload is returned to the frontend Zustand store and presented to the user seamlessly.

## 3. Real-Time WebSocket Federation (The 10k User Problem)
**The Naive Approach**: Spring Boot provides an in-memory `SimpleBroker` for STOMP WebSockets. If you scale to 5 backend instances behind a load balancer, users on Node A cannot see leaderboard updates from users on Node B.

**Our Enterprise Solution**: 
We utilize a **STOMP Broker Relay**. 
- Instead of tracking connections in RAM, the Spring Boot nodes immediately proxy all socket traffic to an external **RabbitMQ cluster** running the STOMP plugin.
- When User 1 finishes a question, Node A publishes a message to RabbitMQ's `/topic/leaderboard`.
- RabbitMQ broadcasts this message down to Node B, C, D, and E simultaneously.
- All 10,000 users see the leaderboard update within milliseconds, regardless of which backend node they are connected to.

## 4. Failure Handling & Resilience
- **Global Error Interception**: The backend utilizes `@RestControllerAdvice` to wrap all unhandled exceptions into a strict API envelope: `{ success: false, message: "...", errorCode: "SYS_ERR" }`.
- **Token Rotation**: The frontend `axios.ts` intercepts `401 Unauthorized` responses and automatically queries the `/refresh` endpoint to exchange a long-lived Refresh Token for a new Access Token. Requests are queued in memory while the refresh occurs, ensuring zero UI disruption.
- **Circuit Breakers (Frontend)**: If the backend goes entirely offline, the `SystemStatus` indicator flashes red and Skeleton Loaders hold the UI structure indefinitely, preventing blank white screens of death.
