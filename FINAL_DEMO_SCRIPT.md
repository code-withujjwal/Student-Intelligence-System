# Final Product Demo Script

Use this exact walkthrough during technical interviews to showcase the platform's enterprise architecture.

## Scene 1: The Adaptive Tutor (Cost-Optimized AI)
**Action**: Log in as a Student. Go to a completed quiz result and click "Explain My Mistake ✨".
**Script**: 
> "Most AI wrappers just spam API calls from the frontend. We don't. When I click this button, React hits our Spring Boot backend. Spring Boot uses a non-blocking WebFlux client to query Gemini. But more importantly, the result is cached in Redis with a 7-day TTL. If 500 students get this exact question wrong with the same incorrect answer, we only pay for a single LLM API call. That is how you build a scalable, cost-controlled AI product."

## Scene 2: Real-Time Federation (RabbitMQ)
**Action**: Open two separate incognito windows side-by-side. Start a live quiz session in both.
**Script**: 
> "Here you can see the Live Leaderboard updating instantly. But the impressive part is the backend architecture. We aren't using Spring's in-memory broker, which breaks the moment you add a Load Balancer. We are using a STOMP Broker Relay tied directly into RabbitMQ. I could spin up 50 instances of this backend in a Kubernetes cluster, and this real-time sync would still work flawlessly."

## Scene 3: Security & Multi-Tenancy (Hibernate Filters)
**Action**: Open the DevTools Network tab and show a generic API call like `/api/quizzes`.
**Script**: 
> "Notice that our frontend API calls don't explicitly ask for a specific organization's data. That's because we have a zero-trust multi-tenant architecture. The JWT contains the user's `tenantId`. An Aspect-Oriented Interceptor (`@Aspect`) in Spring Boot reads that token and injects a Hibernate `@Filter` into the ORM. Every single SQL query automatically receives a `WHERE tenant_id = ?` clause. It is impossible for a developer to accidentally leak data."

## Scene 4: The 401 Interceptor (UX Resilience)
**Action**: Manually corrupt the `jwt_token` in localStorage to simulate an expiration. Try to navigate.
**Script**: 
> "Enterprise UX means never interrupting the user. I just expired my Access Token. The next API call I make returns a 401. But instead of kicking me to the login screen, our Axios Interceptor pauses the execution queue, hits our backend with a long-lived Refresh Token, retrieves a new Access Token, and replays the original request so fast the user doesn't even notice."
