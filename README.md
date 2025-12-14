# Bank Management System

A microservices-based banking simulator with Spring Boot backend, React frontend, Eureka Service Discovery, and API Gateway.

## Architecture

```
                         ┌─────────────────────┐
                         │   Eureka Server     │
                         │     Port 8761       │
                         └──────────┬──────────┘
                                    │ Service Registry
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ Auth Service  │          │Account Service│          │Transaction Svc│
│   Port 8080   │          │   Port 8082   │          │   Port 8083   │
│   auth_db     │          │  account_db   │          │transaction_db │
└───────────────┘          └───────────────┘          └───────────────┘
        │                           │                           │
        │                  ┌───────────────┐                    │
        │                  │Customer Service│                   │
        │                  │   Port 8081   │                    │
        │                  │  customer_db  │                    │
        │                  └───────────────┘                    │
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │    API Gateway      │
                         │     Port 8090       │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   React Frontend    │
                         │     Port 3000       │
                         └─────────────────────┘
```

## Features

### User Features
- User registration with transaction PIN
- Multiple bank accounts per user (Savings, Checking, Current)
- Deposit, Withdraw, Transfer operations
- PIN verification for sensitive operations
- Transaction history
- Account closure (soft delete)

### Admin Features
- Customer management (CRUD with soft delete)
- Account management with status control
- View all transactions
- Freeze/Unfreeze accounts
- Activate/Deactivate customers

### Account Status
| Status | Description |
|--------|-------------|
| ACTIVE | Normal operations allowed |
| FROZEN | All transactions blocked, visible to user with warning |
| CLOSED | Soft deleted, hidden from user, all transactions blocked |

### Customer Status
| Status | Description |
|--------|-------------|
| ACTIVE | Normal customer |
| SUSPENDED | Temporarily blocked |
| INACTIVE | Soft deleted |

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Node.js 18+
- npm 9+

## Database Setup

```bash
psql -U postgres -f sql/schema.sql
```

Or manually:
```sql
CREATE DATABASE auth_db;
CREATE DATABASE customer_db;
CREATE DATABASE account_db;
CREATE DATABASE transaction_db;
```

## Quick Start

Start services in this order:

```bash
# 1. Eureka Server (wait for startup)
cd backend/eureka-server && mvn spring-boot:run

# 2. API Gateway
cd backend/api-gateway && mvn spring-boot:run

# 3. Business Services (can run in parallel)
cd backend/auth-service && mvn spring-boot:run
cd backend/customer-service && mvn spring-boot:run
cd backend/account-service && mvn spring-boot:run
cd backend/transaction-service && mvn spring-boot:run

# 4. Frontend
cd frontend/bank-frontend && npm install && npm run dev
```

## Service Ports

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| Eureka Server | 8761 | - | Service Discovery |
| API Gateway | 8090 | - | Request routing |
| Auth Service | 8080 | auth_db | Authentication, JWT |
| Customer Service | 8081 | customer_db | Customer management |
| Account Service | 8082 | account_db | Account management |
| Transaction Service | 8083 | transaction_db | Transactions |
| Frontend | 3000 | - | React UI |

## URLs

- Frontend: http://localhost:3000
- Eureka Dashboard: http://localhost:8761
- API Gateway: http://localhost:8090

## Tech Stack

**Backend:** Java 17, Spring Boot 3.2, Spring Cloud (Eureka, Gateway), Spring Security, JWT, JPA, PostgreSQL, WebClient

**Frontend:** React 18, React Router 6, Axios, Vite

## Microservices Patterns

- Service Discovery (Eureka)
- API Gateway
- Database per Service
- Inter-service Communication (REST/WebClient)
- Soft Delete
- JWT Authentication
