package com.bank.account.repository;

import com.bank.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByCustomerId(Long customerId);
    List<Account> findByCustomerIdAndStatus(Long customerId, Account.AccountStatus status);
    Optional<Account> findByAccountNumber(String accountNumber);
    Optional<Account> findByAccountNumberAndStatus(String accountNumber, Account.AccountStatus status);
    boolean existsByAccountNumber(String accountNumber);
    List<Account> findByStatus(Account.AccountStatus status);
}
