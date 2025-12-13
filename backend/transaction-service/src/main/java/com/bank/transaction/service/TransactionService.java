package com.bank.transaction.service;

import com.bank.transaction.dto.*;
import com.bank.transaction.entity.Transaction;
import com.bank.transaction.entity.Transaction.TransactionType;
import com.bank.transaction.exception.AccountNotFoundException;
import com.bank.transaction.exception.InsufficientBalanceException;
import com.bank.transaction.repository.TransactionRepository;
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
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final WebClient accountServiceWebClient;

    public Transaction deposit(DepositRequest request) {
        AccountDto account = getAccount(request.getAccountId());
        
        updateAccountBalance(request.getAccountId(), request.getAmount(), true);
        
        Transaction transaction = Transaction.builder()
                .toAccountId(request.getAccountId())
                .amount(request.getAmount())
                .transactionType(TransactionType.DEPOSIT)
                .description(request.getDescription() != null ? request.getDescription() : "Deposit")
                .build();
        
        return transactionRepository.save(transaction);
    }

    public Transaction withdraw(WithdrawRequest request) {
        AccountDto account = getAccount(request.getAccountId());
        
        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for withdrawal");
        }
        
        updateAccountBalance(request.getAccountId(), request.getAmount(), false);
        
        Transaction transaction = Transaction.builder()
                .fromAccountId(request.getAccountId())
                .amount(request.getAmount())
                .transactionType(TransactionType.WITHDRAW)
                .description(request.getDescription() != null ? request.getDescription() : "Withdrawal")
                .build();
        
        return transactionRepository.save(transaction);
    }

    public Transaction transfer(TransferRequest request) {
        if (request.getFromAccountId().equals(request.getToAccountId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }
        
        AccountDto fromAccount = getAccount(request.getFromAccountId());
        AccountDto toAccount = getAccount(request.getToAccountId());
        
        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for transfer");
        }
        
        updateAccountBalance(request.getFromAccountId(), request.getAmount(), false);
        updateAccountBalance(request.getToAccountId(), request.getAmount(), true);
        
        Transaction transaction = Transaction.builder()
                .fromAccountId(request.getFromAccountId())
                .toAccountId(request.getToAccountId())
                .amount(request.getAmount())
                .transactionType(TransactionType.TRANSFER)
                .description(request.getDescription() != null ? request.getDescription() : "Transfer")
                .build();
        
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByAccountId(Long accountId) {
        return transactionRepository.findByAccountId(accountId);
    }

    private AccountDto getAccount(Long accountId) {
        return accountServiceWebClient.get()
                .uri("/accounts/{id}", accountId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                    response -> Mono.error(new AccountNotFoundException("Account not found with id: " + accountId)))
                .bodyToMono(AccountDto.class)
                .block();
    }

    private void updateAccountBalance(Long accountId, BigDecimal amount, boolean isDeposit) {
        String endpoint = isDeposit ? "/accounts/{id}/deposit" : "/accounts/{id}/withdraw";
        accountServiceWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path(endpoint)
                        .queryParam("amount", amount)
                        .build(accountId))
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                    response -> Mono.error(new RuntimeException("Failed to update account balance")))
                .bodyToMono(AccountDto.class)
                .block();
    }
}
