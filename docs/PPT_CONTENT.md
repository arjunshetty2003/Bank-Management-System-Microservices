# Bank Management System - PPT Content

---

## Slide 1: Application Overview

**Application Name:** Bank Management System

**Problem Statement:** Traditional monolithic banking applications struggle with scalability and independent feature deployment.

**Why Microservices?**
- **Scalability** - Scale transaction service independently during peak hours (payday)
- **Independent Deployment** - Update auth service without affecting customer operations
- **Fault Isolation** - If one service fails, others continue working

---

## Slide 2: Microservices Architecture

**List of Microservices (6 services):**

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| Eureka Server | 8761 | - | Service Discovery & Registry |
| API Gateway | 8090 | - | Routing, Load Balancing |
| Auth Service | 8080 | auth_db | Authentication, JWT tokens |
| Customer Service | 8081 | customer_db | Customer CRUD operations |
| Account Service | 8082 | account_db | Bank account management |
| Transaction Service | 8083 | transaction_db | Deposit, Withdraw, Transfer |

**Communication Method:** REST API / HTTP (using Spring WebClient)

**Database per Service:** Yes ✓ (4 separate PostgreSQL databases)

---

## Slide 3: System Architecture Diagram

```
                    ┌─────────────────────┐
                    │   EUREKA SERVER     │
                    │   (Port 8761)       │
                    │  Service Registry   │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│AUTH SERVICE │      │  CUSTOMER   │      │  ACCOUNT    │
│  (8080)     │      │  SERVICE    │      │  SERVICE    │
│  auth_db    │      │  (8081)     │      │  (8082)     │
└─────────────┘      │ customer_db │      │ account_db  │
                     └─────────────┘      └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │TRANSACTION  │
                                          │  SERVICE    │
                                          │  (8083)     │
                                          │transaction_db│
                                          └─────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    API GATEWAY      │
                    │    (Port 8090)      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   REACT FRONTEND    │
                    │    (Port 3000)      │
                    └─────────────────────┘
```

---

## Slide 4: Interaction Between Services

**Example: Money Transfer Flow**

```
1. User clicks "Transfer $100"
         │
         ▼
2. Frontend → API Gateway (8090)
         │
         ▼
3. Gateway routes to Transaction Service (8083)
         │
         ▼
4. Transaction Service → Account Service (8082)
   - GET /accounts/1 (verify source account)
   - GET /accounts/2 (verify destination account)
   - POST /accounts/1/withdraw
   - POST /accounts/2/deposit
         │
         ▼
5. Transaction Service saves record to transaction_db
         │
         ▼
6. Response flows back to user
```

**Inter-Service Communication:**
- Uses Spring WebClient (non-blocking HTTP client)
- Services discover each other via Eureka (no hardcoded URLs in production)

---

## Slide 5: Service Discovery & Configuration

**Service Discovery Mechanism:** Netflix Eureka

**How it works:**
1. Eureka Server starts first (port 8761)
2. Each microservice registers itself with Eureka on startup
3. Services query Eureka to find other services
4. API Gateway uses Eureka for load-balanced routing

**Eureka Dashboard:** http://localhost:8761

**Configuration Approach:**
- Each service has its own `application.yml`
- Shared JWT secret across services for token validation
- Database credentials per service

**Benefits:**
- Dynamic service discovery (no hardcoded IPs)
- Health monitoring
- Load balancing support

---

## Slide 6: API Gateway

**Role of API Gateway:**
- Single entry point for all client requests
- Routes requests to appropriate microservices
- Handles cross-cutting concerns (CORS, security)

**Technology:** Spring Cloud Gateway

**Routing Configuration:**

| Client Request | Routed To |
|----------------|-----------|
| /auth/** | AUTH-SERVICE |
| /customers/** | CUSTOMER-SERVICE |
| /accounts/** | ACCOUNT-SERVICE |
| /transactions/** | TRANSACTION-SERVICE |

**Request Handling Flow:**
```
Client → API Gateway → Eureka (lookup) → Target Service → Response
```

**Benefits:**
- Simplified client (only knows one URL)
- Centralized authentication
- Rate limiting capability
- Load balancing (lb:// prefix)

---

## Slide 7: Design Challenges

| Challenge | Solution Implemented |
|-----------|---------------------|
| **Data Consistency** | Each service owns its data; eventual consistency |
| **Distributed Transactions** | Saga pattern (sequential service calls with rollback) |
| **Service Communication** | REST with WebClient; retry mechanisms |
| **Authentication** | Shared JWT secret; stateless token validation |
| **Service Discovery** | Eureka for dynamic registration |
| **Single Point of Entry** | API Gateway for routing |

**Trade-offs Made:**
- Chose REST over message queues (simpler for college project)
- Synchronous communication (easier to debug)
- Shared JWT secret (vs. centralized auth server)

---

## Slide 8: Deployment & Monitoring Challenges

**Deployment Challenges:**

| Challenge | Description |
|-----------|-------------|
| **Startup Order** | Eureka must start first, then Gateway, then services |
| **Port Management** | 6 services = 6 different ports to manage |
| **Database Setup** | 4 separate databases to create and maintain |
| **Configuration Sync** | JWT secret must match across all services |

**Monitoring Challenges:**

| Challenge | Potential Solution |
|-----------|-------------------|
| **Distributed Logging** | ELK Stack (Elasticsearch, Logstash, Kibana) |
| **Service Health** | Spring Actuator + Eureka health checks |
| **Request Tracing** | Spring Cloud Sleuth + Zipkin |
| **Metrics** | Prometheus + Grafana |

**Production Recommendations:**
- Use Docker/Kubernetes for container orchestration
- Implement circuit breakers (Resilience4j)
- Add centralized configuration (Spring Cloud Config)
- Set up CI/CD pipelines

---

## Slide 9: Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.2
- Spring Cloud (Eureka, Gateway)
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Lombok

**Frontend:**
- React 18
- React Router 6
- Axios
- Vite

**Tools:**
- Maven (build)
- Git (version control)

---

## Slide 10: Demo & Conclusion

**Live Demo:**
1. Show Eureka Dashboard (registered services)
2. Login as admin/user
3. Create customer → Create account → Perform transaction
4. Show API Gateway routing

**Key Takeaways:**
- Microservices enable independent scaling and deployment
- Service discovery eliminates hardcoded URLs
- API Gateway simplifies client integration
- Database per service ensures loose coupling

**Future Enhancements:**
- Add message queues (RabbitMQ/Kafka)
- Implement circuit breakers
- Add Docker containerization
- Set up Kubernetes deployment

---

## Appendix: Quick Reference

**Startup Commands:**
```bash
# 1. Eureka Server
cd backend/eureka-server && mvn spring-boot:run

# 2. API Gateway
cd backend/api-gateway && mvn spring-boot:run

# 3. Services (parallel)
cd backend/auth-service && mvn spring-boot:run
cd backend/customer-service && mvn spring-boot:run
cd backend/account-service && mvn spring-boot:run
cd backend/transaction-service && mvn spring-boot:run

# 4. Frontend
cd frontend/bank-frontend && npm install && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8090
- Eureka Dashboard: http://localhost:8761
