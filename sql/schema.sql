-- Create databases
CREATE DATABASE auth_db;
CREATE DATABASE customer_db;
CREATE DATABASE account_db;
CREATE DATABASE transaction_db;

-- Auth Service Schema (auth_db)
\c auth_db;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    transaction_pin VARCHAR(255)
);

-- Default users (passwords are BCrypt hashed: admin123, user123)
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLqnvaNK7GHnYGJfIXNova2.', 'ADMIN'),
('user', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbLgtnOoKsWc/XGKHYePtLzqaC3Hy', 'USER');

-- Customer Service Schema (customer_db)
\c customer_db;

CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    address VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

-- Sample customers
INSERT INTO customers (name, email, phone, address) VALUES
('John Doe', 'john.doe@example.com', '555-0101', '123 Main St, City'),
('Jane Smith', 'jane.smith@example.com', '555-0102', '456 Oak Ave, Town'),
('Bob Johnson', 'bob.johnson@example.com', '555-0103', '789 Pine Rd, Village');

-- Account Service Schema (account_db)
\c account_db;

CREATE TABLE accounts (
    account_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);

-- Sample accounts
INSERT INTO accounts (customer_id, account_number, account_type, balance) VALUES
(1, 'ACC1000000001', 'SAVINGS', 5000.00),
(1, 'ACC1000000002', 'CHECKING', 2500.00),
(2, 'ACC1000000003', 'SAVINGS', 10000.00),
(3, 'ACC1000000004', 'CURRENT', 7500.00);

-- Transaction Service Schema (transaction_db)
\c transaction_db;

CREATE TABLE transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    from_account_id BIGINT,
    to_account_id BIGINT,
    amount DECIMAL(19, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(500)
);

CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);

-- Sample transactions
INSERT INTO transactions (from_account_id, to_account_id, amount, transaction_type, description) VALUES
(NULL, 1, 1000.00, 'DEPOSIT', 'Initial deposit'),
(1, NULL, 200.00, 'WITHDRAW', 'ATM withdrawal'),
(1, 3, 500.00, 'TRANSFER', 'Transfer to Jane');
