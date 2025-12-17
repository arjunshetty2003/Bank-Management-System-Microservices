package com.bank.transaction;

import com.bank.transaction.entity.Transaction;
import com.bank.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TransactionServiceTests {

    @Autowired
    private TransactionRepository transactionRepository;

    @Test
    void contextLoads() {
        assertNotNull(transactionRepository);
    }

    @Test
    void shouldSaveDepositTransaction() {
        Transaction transaction = Transaction.builder()
                .toAccountId(1L)
                .amount(BigDecimal.valueOf(500))
                .transactionType(Transaction.TransactionType.DEPOSIT)
                .description("Test deposit")
                .build();

        Transaction saved = transactionRepository.save(transaction);

        assertNotNull(saved.getTransactionId());
        assertEquals(BigDecimal.valueOf(500), saved.getAmount());
        assertEquals(Transaction.TransactionType.DEPOSIT, saved.getTransactionType());
    }

    @Test
    void shouldSaveWithdrawTransaction() {
        Transaction transaction = Transaction.builder()
                .fromAccountId(1L)
                .amount(BigDecimal.valueOf(200))
                .transactionType(Transaction.TransactionType.WITHDRAW)
                .description("Test withdrawal")
                .build();

        Transaction saved = transactionRepository.save(transaction);

        assertNotNull(saved.getTransactionId());
        assertEquals(Transaction.TransactionType.WITHDRAW, saved.getTransactionType());
    }

    @Test
    void shouldSaveTransferTransaction() {
        Transaction transaction = Transaction.builder()
                .fromAccountId(1L)
                .toAccountId(2L)
                .amount(BigDecimal.valueOf(100))
                .transactionType(Transaction.TransactionType.TRANSFER)
                .description("Test transfer")
                .build();

        Transaction saved = transactionRepository.save(transaction);

        assertNotNull(saved.getTransactionId());
        assertEquals(Transaction.TransactionType.TRANSFER, saved.getTransactionType());
        assertEquals(1L, saved.getFromAccountId());
        assertEquals(2L, saved.getToAccountId());
    }

    @Test
    void shouldFindTransactionsByAccountId() {
        // Create test transaction
        Transaction deposit = Transaction.builder()
                .toAccountId(9999L)
                .amount(BigDecimal.valueOf(500))
                .transactionType(Transaction.TransactionType.DEPOSIT)
                .description("Test deposit")
                .build();
        transactionRepository.save(deposit);

        List<Transaction> transactions = transactionRepository.findByAccountId(9999L);
        
        assertFalse(transactions.isEmpty());
    }

    @Test
    void transactionTypeEnumValues() {
        assertEquals(3, Transaction.TransactionType.values().length);
        assertNotNull(Transaction.TransactionType.valueOf("DEPOSIT"));
        assertNotNull(Transaction.TransactionType.valueOf("WITHDRAW"));
        assertNotNull(Transaction.TransactionType.valueOf("TRANSFER"));
    }

    @Test
    void shouldSetTimestampAutomatically() {
        Transaction transaction = Transaction.builder()
                .toAccountId(1L)
                .amount(BigDecimal.valueOf(100))
                .transactionType(Transaction.TransactionType.DEPOSIT)
                .build();

        Transaction saved = transactionRepository.save(transaction);

        assertNotNull(saved.getTimestamp());
    }
}
