# Scalability Refactor: Distributed Microservices Architecture

While Phase 8 focused on Dockerizing the existing monolith for an immediate production launch, reaching massive scale (>10,000 concurrent users) requires splitting the system into specialized microservices. This document outlines the target architecture.

## 1. Domain-Driven Service Split

### A. API Gateway (Spring Cloud Gateway)
- **Responsibility**: Single entry point for the React frontend.
- **Features**: JWT token validation, rate-limiting (Redis), dynamic routing to downstream services.

### B. Identity & Access Management (IAM) Service
- **Responsibility**: User registration, login, JWT issuance, and Role-Based Access Control (RBAC).
- **Database**: Dedicated `auth_db` containing `UserEntity`.

### C. Core Quiz Service
- **Responsibility**: Quiz creation, question bank CRUD, static quiz delivery.
- **Database**: `quiz_db` (containing `QuizEntity`, `QuestionEntity`).

### D. Live WebSocket Engine
- **Responsibility**: High-throughput real-time multiplayer coordination via STOMP WebSockets.
- **Scaling Mechanism**: STOMP Broker Relay connected to an external RabbitMQ cluster. Multiple instances of this service scale horizontally.

### E. AI & Analytics Service
- **Responsibility**: Heavy computational loads: Adaptive Quiz generation, predictive modeling, spaced repetition analysis, and PDF export rendering.
- **Database**: `analytics_db` (containing `StudentProfileEntity`, `BehaviorLogEntity`, `ConceptGraphEntity`).

## 2. Cross-Service Communication
- **Synchronous**: Services communicate via internal REST APIs or gRPC (e.g., `Quiz Service` fetching user roles from `IAM Service`).
- **Asynchronous (Event-Driven)**: `Live WebSocket Engine` publishes events (e.g., `QUIZ_FINISHED_EVENT`) to RabbitMQ. The `AI & Analytics Service` subscribes to this queue and processes the behavior logs asynchronously without blocking the user response.

## 3. Database & Caching Optimization
- **Redis Strategy**: 
  - `Global Leaderboard Cache`: Shared across all nodes.
  - `Session Token Cache`: Blacklisted JWTs.
- **Database Strategy**: Transition from a single `quiz_platform` database to logically isolated schemas/databases per service to prevent locking contention.

## Deployment Target
- **Environment**: Amazon EKS (Elastic Kubernetes Service).
- **Autoscaling**: Horizontal Pod Autoscalers (HPA) attached to CPU/Memory thresholds. The `Live WebSocket Engine` will scale based on active WebSocket connection counts.
