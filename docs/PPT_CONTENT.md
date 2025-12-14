# Bank Management System - Microservices PPT Documentation

---

## Slide 1: Application Overview

**Application Name:** Bank Management System (Banking Simulator)

**Problem Statement:** Traditional monolithic banking applications face challenges in scaling individual components and deploying updates without system-wide downtime.

**Why Microservices?**

| Benefit | Explanation |
|---------|-------------|
| **Scalability** | Scale transaction service independently during peak hours (e.g., payday, month-end) without scaling the entire application |
| **Independent Deployment** | Update authentication logic without affecting account or transaction operations; deploy bug fixes to one service without redeploying all |
| **Fault Isolation** | If customer service fails, users can still perform transactions on existing accounts |
| **Technology Flexibility** | Each service can use different databases, frameworks, or languages if needed |

---

## Slide 2: List of Microservices

**Total Services: 6 Microservices**

| # | Service | Port | Database | Primary Responsibility |
|---|---------|------|----------|------------------------|
| 1 | **Eureka Server** | 8761 | - | Service Discovery & Registry |
| 2 | **API Gateway** | 8090 | - | Request Routing, CORS, Load Balancing |
| 3 | **Auth Service** | 8080 | auth_db | User Registration, Login, JWT Tokens, PIN Validation |
| 4 | **Customer Service** | 8081 | customer_db | Customer Profile CRUD, Status Management |
| 5 | **Account Service** | 8082 | account_db | Bank Account CRUD, Balance Management, Account Status |
| 6 | **Transaction Service** | 8083 | transaction_db | Deposit, Withdraw, Transfer Operations |

**Communication Method:** REST API / HTTP
- Synchronous communication using Spring WebClient (non-blocking HTTP client)
- Services communicate via HTTP REST endpoints

**Database per Service:** ✅ Yes
- 4 separate PostgreSQL databases (auth_db, customer_db, account_db, transaction_db)
- Each service owns and manages its own data
- No direct database sharing between services

---

## Slide 3: System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│                    ┌─────────────────────────┐                          │
│                    │     React Frontend      │                          │
│                    │      (Port 3000)        │                          │
│                    │   - User Dashboard      │                          │
│                    │   - Admin Panel         │                          │
│                    └───────────┬─────────────┘                          │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │ HTTP Requests
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            GATEWAY LAYER                                 │
│                    ┌─────────────────────────┐                          │
│                    │      API Gateway        │                          │
│                    │      (Port 8090)        │                          │
│                    │   - Route Requests      │                          │
│                    │   - CORS Handling       │                          │
│                    │   - Load Balancing      │                          │
│                    └───────────┬─────────────┘                          │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐│
│  │AUTH SERVICE │    │  CUSTOMER   │    │  ACCOUNT    │    │TRANSACTION││
│  │  (8080)     │    │  SERVICE    │    │  SERVICE    │    │ SERVICE   ││
│  │             │    │  (8081)     │    │  (8082)     │    │  (8083)   ││
│  │ - Login     │    │             │    │             │    │           ││
│  │ - Register  │    │ - CRUD      │    │ - CRUD      │    │ - Deposit ││
│  │ - JWT       │    │ - Status    │    │ - Balance   │    │ - Withdraw││
│  │ - PIN       │    │   Mgmt      │    │ - Status    │    │ - Transfer││
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └─────┬─────┘│
└─────────┼──────────────────┼──────────────────┼─────────────────┼──────┘
          │                  │                  │                 │
          ▼                  ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                                  │
│     ┌─────────┐      ┌─────────────┐    ┌───────────┐   ┌─────────────┐│
│     │ auth_db │      │ customer_db │    │account_db │   │transaction_db│
│     │         │      │             │    │           │   │             ││
│     │ - users │      │ - customers │    │ - accounts│   │-transactions││
│     └─────────┘      └─────────────┘    └───────────┘   └─────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     EUREKA SERVER       │
                    │      (Port 8761)        │
                    │   Service Registry      │
                    │   Health Monitoring     │
                    └─────────────────────────┘
```

---

## Slide 4: Interaction Between Services

### Example Flow: Money Transfer Operation

```
┌──────────┐     ┌───────────┐     ┌─────────────────┐     ┌───────────────┐     ┌──────────────┐
│  User    │     │  Frontend │     │   API Gateway   │     │  Transaction  │     │   Account    │
│          │     │           │     │                 │     │    Service    │     │   Service    │
└────┬─────┘     └─────┬─────┘     └────────┬────────┘     └───────┬───────┘     └──────┬───────┘
     │                 │                    │                      │                    │
     │ 1. Transfer     │                    │                      │                    │
     │    $100         │                    │                      │                    │
     │────────────────>│                    │                      │                    │
     │                 │ 2. POST /transactions/transfer            │                    │
     │                 │───────────────────>│                      │                    │
     │                 │                    │ 3. Route to          │                    │
     │                 │                    │    TRANSACTION-SERVICE                    │
     │                 │                    │─────────────────────>│                    │
     │                 │                    │                      │ 4. Validate PIN    │
     │                 │                    │                      │    (Auth Service)  │
     │                 │                    │                      │                    │
     │                 │                    │                      │ 5. GET /accounts/1 │
     │                 │                    │                      │───────────────────>│
     │                 │                    │                      │<───────────────────│
     │                 │                    │                      │ 6. Validate Status │
     │                 │                    │                      │                    │
     │                 │                    │                      │ 7. GET /accounts/2 │
     │                 │                    │                      │───────────────────>│
     │                 │                    │                      │<───────────────────│
     │                 │                    │                      │ 8. Validate Status │
     │                 │                    │                      │                    │
     │                 │                    │                      │ 9. POST withdraw   │
     │                 │                    │                      │───────────────────>│
     │                 │                    │                      │<───────────────────│
     │                 │                    │                      │                    │
     │                 │                    │                      │ 10. POST deposit   │
     │                 │                    │                      │───────────────────>│
     │                 │                    │                      │<───────────────────│
     │                 │                    │                      │                    │
     │                 │                    │                      │ 11. Save Transaction
     │                 │                    │                      │     Record         │
     │                 │                    │<─────────────────────│                    │
     │                 │<───────────────────│                      │                    │
     │<────────────────│ 12. Success        │                      │                    │
     │                 │                    │                      │                    │
```

### Inter-Service Communication Summary

| From Service | To Service | Method | Purpose |
|--------------|------------|--------|---------|
| Transaction | Account | GET /accounts/{id} | Fetch account details & balance |
| Transaction | Account | POST /accounts/{id}/deposit | Add funds |
| Transaction | Account | POST /accounts/{id}/withdraw | Deduct funds |
| Transaction | Auth | POST /auth/validate-pin | Verify user PIN |
| Account | Customer | GET /customers/{id} | Validate customer exists |
| Account | Customer | GET /customers/user/{username} | Get customer by username |

---

## Slide 5: Service Discovery & Configuration

### Service Discovery Mechanism: Netflix Eureka

**How Eureka Works:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      EUREKA SERVER (8761)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Service Registry                         │  │
│  │  ┌─────────────┬─────────────┬─────────────┬────────────┐ │  │
│  │  │AUTH-SERVICE │CUSTOMER-SVC │ACCOUNT-SVC  │TRANSACTION │ │  │
│  │  │ 8080        │ 8081        │ 8082        │ 8083       │ │  │
│  │  │ UP          │ UP          │ UP          │ UP         │ │  │
│  │  └─────────────┴─────────────┴─────────────┴────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │ Register           │ Heartbeat          │ Discover
         │                    │ (30s)              │
    ┌────┴────┐          ┌────┴────┐          ┌────┴────┐
    │ Service │          │ Service │          │ Gateway │
    │ Startup │          │ Running │          │ Routing │
    └─────────┘          └─────────┘          └─────────┘
```

**Registration Process:**
1. Eureka Server starts first (Port 8761)
2. Each microservice registers on startup with name, IP, port
3. Services send heartbeat every 30 seconds
4. Eureka removes services that miss 3 heartbeats
5. API Gateway queries Eureka to discover service locations

**Configuration Approach:**
- Each service has its own `application.yml`
- Shared JWT secret key across Auth, Account, Customer services
- Database credentials isolated per service
- Eureka URL configured in all services: `http://localhost:8761/eureka/`

**Eureka Dashboard:** http://localhost:8761

---

## Slide 6: API Gateway

### Role of API Gateway

**Spring Cloud Gateway** serves as the single entry point for all client requests.

**Key Responsibilities:**

| Function | Description |
|----------|-------------|
| **Request Routing** | Routes requests to appropriate microservices based on URL path |
| **Load Balancing** | Uses `lb://` prefix for client-side load balancing via Eureka |
| **CORS Handling** | Centralized Cross-Origin Resource Sharing configuration |
| **Single Entry Point** | Clients only need to know one URL (port 8090) |

### Routing Configuration

```yaml
routes:
  - id: auth-service
    uri: lb://AUTH-SERVICE
    predicates:
      - Path=/auth/**

  - id: customer-service
    uri: lb://CUSTOMER-SERVICE
    predicates:
      - Path=/customers/**

  - id: account-service
    uri: lb://ACCOUNT-SERVICE
    predicates:
      - Path=/accounts/**

  - id: transaction-service
    uri: lb://TRANSACTION-SERVICE
    predicates:
      - Path=/transactions/**
```

### Request Flow Through Gateway

```
Client Request                    API Gateway                     Target Service
     │                                │                                │
     │  GET /accounts/123             │                                │
     │───────────────────────────────>│                                │
     │                                │  1. Match path /accounts/**    │
     │                                │  2. Lookup ACCOUNT-SERVICE     │
     │                                │     in Eureka                  │
     │                                │  3. Get instance: 8082         │
     │                                │───────────────────────────────>│
     │                                │<───────────────────────────────│
     │<───────────────────────────────│  4. Return response            │
     │                                │                                │
```

**Benefits:**
- Frontend only knows one URL (http://localhost:8090)
- Easy to add rate limiting, authentication filters
- Centralized logging and monitoring point
- Simplified SSL/TLS termination

---

## Slide 7: Design Challenges

| Challenge | Problem | Solution Implemented |
|-----------|---------|---------------------|
| **Data Consistency** | No shared database; data spread across services | Each service owns its data; eventual consistency accepted |
| **Distributed Transactions** | Transfer needs atomic update across services | Saga pattern - sequential calls with compensation on failure |
| **Service Communication Failure** | What if Account Service is down during transfer? | WebClient with error handling; transaction fails gracefully |
| **Authentication Across Services** | How to validate JWT in each service? | Shared JWT secret; stateless token validation |
| **Service Discovery** | Services don't know each other's IP/port | Eureka for dynamic registration; `lb://` for discovery |
| **Single Point of Entry** | Multiple service URLs confuse clients | API Gateway routes all requests |
| **Account Status Validation** | Frozen/Closed accounts shouldn't transact | Transaction Service validates status before operations |

### Trade-offs Made

| Decision | Alternative | Why This Choice |
|----------|-------------|-----------------|
| REST over Message Queues | RabbitMQ/Kafka | Simpler implementation; easier debugging |
| Synchronous Communication | Async messaging | Immediate feedback to users; simpler error handling |
| Shared JWT Secret | OAuth2/Keycloak | Reduced complexity for project scope |
| PostgreSQL for all | Polyglot persistence | Consistent tooling; easier maintenance |

---

## Slide 8: Deployment & Monitoring Challenges

### Deployment Challenges

| Challenge | Description | Mitigation |
|-----------|-------------|------------|
| **Startup Order Dependency** | Eureka must start first, then Gateway, then services | Document startup sequence; use health checks |
| **Port Management** | 6 services = 6 ports (8761, 8090, 8080-8083) | Clear port documentation; avoid conflicts |
| **Database Setup** | 4 separate databases to create | Provide SQL scripts (`sql/schema.sql`) |
| **Configuration Sync** | JWT secret must match across services | Centralize in documentation; consider Config Server |
| **Network Configuration** | Services must reach each other | Use localhost for dev; service mesh for prod |

### Monitoring Challenges

| Challenge | Current State | Production Solution |
|-----------|---------------|---------------------|
| **Distributed Logging** | Console logs per service | ELK Stack (Elasticsearch, Logstash, Kibana) |
| **Service Health** | Eureka dashboard | Spring Actuator + Prometheus |
| **Request Tracing** | Manual correlation | Spring Cloud Sleuth + Zipkin |
| **Performance Metrics** | None | Prometheus + Grafana dashboards |
| **Alerting** | None | PagerDuty/Slack integration |

### Production Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Docker    │  │ Kubernetes  │  │  CI/CD Pipeline     │  │
│  │ Containers  │──│ Orchestration│──│  (GitHub Actions)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Resilience4j│  │Spring Cloud │  │  Centralized        │  │
│  │ Circuit     │  │ Config      │  │  Logging (ELK)      │  │
│  │ Breaker     │  │ Server      │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Slide 9: Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming Language |
| Spring Boot | 3.2 | Application Framework |
| Spring Cloud Netflix Eureka | - | Service Discovery |
| Spring Cloud Gateway | - | API Gateway |
| Spring Security | - | Authentication & Authorization |
| JWT (JSON Web Tokens) | - | Stateless Authentication |
| Spring Data JPA | - | Database ORM |
| PostgreSQL | 14+ | Relational Database |
| Spring WebClient | - | Non-blocking HTTP Client |
| Lombok | - | Boilerplate Reduction |
| Maven | 3.8+ | Build Tool |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI Library |
| React Router | 6 | Client-side Routing |
| Axios | - | HTTP Client |
| Vite | - | Build Tool & Dev Server |
| CSS | - | Styling |

---

## Slide 10: Key Features Implemented

### User Features
- ✅ User Registration with Transaction PIN
- ✅ JWT-based Authentication
- ✅ Multiple Accounts per User (Savings, Checking, Current)
- ✅ Deposit, Withdraw, Transfer Operations
- ✅ PIN Verification for Sensitive Operations
- ✅ Transaction History
- ✅ Account Closure (Soft Delete)

### Admin Features
- ✅ Customer Management (CRUD with Soft Delete)
- ✅ Account Status Control (Active/Frozen/Closed)
- ✅ Customer Status Control (Active/Suspended/Inactive)
- ✅ View All Transactions
- ✅ Freeze/Unfreeze Accounts

### Account Status Behavior

| Status | User View | Transactions | Admin Action |
|--------|-----------|--------------|--------------|
| ACTIVE | ✅ Visible | ✅ Allowed | Can freeze/close |
| FROZEN | ✅ Visible (with warning) | ❌ Blocked | Can activate/close |
| CLOSED | ❌ Hidden | ❌ Blocked | Soft deleted |

---

## Slide 11: Demo Flow

### Live Demonstration Steps

1. **Show Eureka Dashboard** (http://localhost:8761)
   - All 5 services registered and UP

2. **User Registration Flow**
   - Register new user with username, password, PIN
   - Auto-creates customer profile

3. **Account Operations**
   - Create Savings account
   - Deposit $500
   - Create Checking account
   - Transfer $100 between accounts

4. **Admin Operations**
   - Login as admin
   - View all customers
   - Freeze a user's account
   - Show user cannot transact on frozen account

5. **API Gateway Routing**
   - Show requests going through port 8090
   - Demonstrate routing to different services

---

## Slide 12: Conclusion & Future Enhancements

### Key Takeaways

| Microservices Benefit | How We Achieved It |
|-----------------------|-------------------|
| Independent Scaling | Each service can scale separately |
| Independent Deployment | Update one service without affecting others |
| Fault Isolation | Service failure doesn't crash entire system |
| Technology Flexibility | Database per service pattern |
| Team Autonomy | Each service can be developed independently |

### Future Enhancements

| Enhancement | Benefit |
|-------------|---------|
| Message Queues (RabbitMQ/Kafka) | Async communication, better decoupling |
| Circuit Breakers (Resilience4j) | Fault tolerance, graceful degradation |
| Docker Containerization | Consistent deployment environments |
| Kubernetes Deployment | Auto-scaling, self-healing |
| Spring Cloud Config | Centralized configuration management |
| Distributed Tracing (Zipkin) | Request tracking across services |
| API Documentation (Swagger) | Auto-generated API docs |

---

## Appendix: Quick Reference

### Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8090 |
| Eureka Dashboard | http://localhost:8761 |

### Startup Commands

```bash
# 1. Start Eureka Server (FIRST - wait for startup)
cd backend/eureka-server && mvn spring-boot:run

# 2. Start API Gateway
cd backend/api-gateway && mvn spring-boot:run

# 3. Start Business Services (can run in parallel)
cd backend/auth-service && mvn spring-boot:run
cd backend/customer-service && mvn spring-boot:run
cd backend/account-service && mvn spring-boot:run
cd backend/transaction-service && mvn spring-boot:run

# 4. Start Frontend
cd frontend/bank-frontend && npm install && npm run dev
```

### Database Setup

```sql
-- Run in PostgreSQL
CREATE DATABASE auth_db;
CREATE DATABASE customer_db;
CREATE DATABASE account_db;
CREATE DATABASE transaction_db;
```

---

## Questions?

**Project Repository:** [Your GitHub URL]

**Technologies Used:**
- Spring Boot 3.2 + Spring Cloud
- React 18 + Vite
- PostgreSQL
- Netflix Eureka
- Spring Cloud Gateway
