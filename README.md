# Bank Management System

A microservices-based banking application with Spring Boot backend and React frontend.

## Architecture

```
┌─────────────────┐
│  Auth Service   │
│    Port 8080    │
│    auth_db      │
└────────┬────────┘
         │ JWT tokens
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Customer Service│     │ Account Service │     │Transaction Svc  │
│    Port 8081    │◄────│    Port 8082    │◄────│    Port 8083    │
│   customer_db   │     │   account_db    │     │ transaction_db  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲                      ▲                       ▲
         └──────────────────────┴───────────────────────┘
                                │
                    ┌───────────────────────┐
                    │   React Frontend      │
                    │      Port 3000        │
                    └───────────────────────┘
```

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Node.js 18+
- npm 9+

## Database Setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create databases
CREATE DATABASE auth_db;
CREATE DATABASE customer_db;
CREATE DATABASE account_db;
CREATE DATABASE transaction_db;
```

Or run the full schema:
```bash
psql -U postgres -f sql/schema.sql
```

## Backend Setup

### Auth Service (Port 8080)
```bash
cd backend/auth-service
mvn spring-boot:run
```

### Customer Service (Port 8081)
```bash
cd backend/customer-service
mvn spring-boot:run
```

### Account Service (Port 8082)
```bash
cd backend/account-service
mvn spring-boot:run
```

### Transaction Service (Port 8083)
```bash
cd backend/transaction-service
mvn spring-boot:run
```

## Frontend Setup

```bash
cd frontend/bank-frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## Service Ports

| Service             | Port | Database       |
|---------------------|------|----------------|
| Auth Service        | 8080 | auth_db        |
| Customer Service    | 8081 | customer_db    |
| Account Service     | 8082 | account_db     |
| Transaction Service | 8083 | transaction_db |
| React Frontend      | 3000 | -              |

## Default Users

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | ADMIN |
| user     | user123  | USER  |

## API Endpoints

### Auth Service (8080)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/validate` - Validate token

### Customer Service (8081)
- `POST /customers` - Create customer (ADMIN only)
- `GET /customers` - Get all customers
- `GET /customers/{id}` - Get customer by ID
- `PUT /customers/{id}` - Update customer (ADMIN only)
- `DELETE /customers/{id}` - Delete customer (ADMIN only)

### Account Service (8082)
- `POST /accounts` - Create account
- `GET /accounts` - Get all accounts
- `GET /accounts/{id}` - Get account by ID
- `GET /accounts/customer/{customerId}` - Get accounts by customer
- `PUT /accounts/{id}` - Update account (ADMIN only)
- `DELETE /accounts/{id}` - Delete account (ADMIN only)

### Transaction Service (8083)
- `POST /transactions/deposit` - Deposit money
- `POST /transactions/withdraw` - Withdraw money
- `POST /transactions/transfer` - Transfer between accounts
- `GET /transactions/account/{accountId}` - Get transaction history

## Sample API Requests

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Create Customer (with token)
```bash
curl -X POST http://localhost:8081/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"555-0101","address":"123 Main St"}'
```

### Deposit
```bash
curl -X POST http://localhost:8083/transactions/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"accountId":1,"amount":500,"description":"Deposit"}'
```

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Lombok
- WebClient (inter-service communication)

### Frontend
- React 18
- React Router 6
- Axios
- Vite
