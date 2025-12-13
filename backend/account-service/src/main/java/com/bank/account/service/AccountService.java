package com.bank.account.service;

import com.bank.account.dto.AccountRequest;
import com.bank.account.entity.Account;
import com.bank.account.exception.AccountNotFoundException;
import com.bank.account.exception.CustomerNotFoundException;
import com.bank.account.exception.InsufficientBalanceException;
import com.bank.account.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {
    private final AccountRepository accountRepository;
    private final WebClient customerServiceWebClient;

    public Account createAccount(AccountRequest request) {
        validateCustomerExists(request.getCustomerId());
        
        Account account = Account.builder()
                .customerId(request.getCustomerId())
                .accountType(request.getAccountType())
                .balance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .build();
        
        return accountRepository.save(account);
    }

    @Transactional(readOnly = true)
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Account> getAccountsByCustomerId(Long customerId) {
        return accountRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account updateAccount(Long id, AccountRequest request) {
        Account account = getAccountById(id);
        if (!account.getCustomerId().equals(request.getCustomerId())) {
            validateCustomerExists(request.getCustomerId());
            account.setCustomerId(request.getCustomerId());
        }
        account.setAccountType(request.getAccountType());
        return accountRepository.save(account);
    }

    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new AccountNotFoundException("Account not found with id: " + id);
        }
        accountRepository.deleteById(id);
    }

    public Account deposit(Long accountId, BigDecimal amount) {
        Account account = getAccountById(accountId);
        account.setBalance(account.getBalance().add(amount));
        return accountRepository.save(account);
    }

    public Account withdraw(Long accountId, BigDecimal amount) {
        Account account = getAccountById(accountId);
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for withdrawal");
        }
        account.setBalance(account.getBalance().subtract(amount));
        return accountRepository.save(account);
    }

    private void validateCustomerExists(Long customerId) {
        customerServiceWebClient.get()
                .uri("/customers/{id}", customerId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, 
                    response -> Mono.error(new CustomerNotFoundException("Customer not found with id: " + customerId)))
                .bodyToMono(Object.class)
                .block();
    }
}
