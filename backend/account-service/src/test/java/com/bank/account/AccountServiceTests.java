package com.bank.account;

import com.bank.account.entity.Account;
import com.bank.account.repository.AccountRepository;
import com.bank.account.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AccountServiceTests {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountService accountService;

    private Account testAccount;

    @BeforeEach
    void setUp() {
        // Create test account
        testAccount = Account.builder()
                .customerId(999L)
                .accountNumber("TEST" + System.currentTimeMillis())
                .accountType(Account.AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(1000))
                .status(Account.AccountStatus.ACTIVE)
                .build();
    }

    @Test
    void contextLoads() {
        assertNotNull(accountRepository);
        assertNotNull(accountService);
    }

    @Test
    void shouldSaveAccount() {
        Account saved = accountRepository.save(testAccount);
        
        assertNotNull(saved.getAccountId());
        assertEquals(Account.AccountType.SAVINGS, saved.getAccountType());
        assertEquals(Account.AccountStatus.ACTIVE, saved.getStatus());
    }

    @Test
    void shouldGetAllAccounts() {
        accountRepository.save(testAccount);
        
        List<Account> accounts = accountService.getAllAccounts();
        
        assertFalse(accounts.isEmpty());
    }

    @Test
    void shouldDepositMoney() {
        Account saved = accountRepository.save(testAccount);
        BigDecimal initialBalance = saved.getBalance();
        
        Account updated = accountService.deposit(saved.getAccountId(), BigDecimal.valueOf(250));
        
        assertEquals(initialBalance.add(BigDecimal.valueOf(250)).compareTo(updated.getBalance()), 0);
    }

    @Test
    void shouldWithdrawMoney() {
        Account saved = accountRepository.save(testAccount);
        
        Account updated = accountService.withdraw(saved.getAccountId(), BigDecimal.valueOf(200));
        
        assertEquals(BigDecimal.valueOf(800).compareTo(updated.getBalance()), 0);
    }

    @Test
    void shouldRejectWithdrawInsufficientBalance() {
        testAccount.setBalance(BigDecimal.valueOf(100));
        Account saved = accountRepository.save(testAccount);
        
        assertThrows(RuntimeException.class, () -> {
            accountService.withdraw(saved.getAccountId(), BigDecimal.valueOf(500));
        });
    }

    @Test
    void shouldFreezeAccount() {
        Account saved = accountRepository.save(testAccount);
        
        Account frozen = accountService.updateAccountStatus(saved.getAccountId(), "FROZEN");
        
        assertEquals(Account.AccountStatus.FROZEN, frozen.getStatus());
    }

    @Test
    void shouldCloseAccountWithZeroBalance() {
        testAccount.setBalance(BigDecimal.ZERO);
        Account saved = accountRepository.save(testAccount);
        
        Account closed = accountService.closeAccount(saved.getAccountId());
        
        assertEquals(Account.AccountStatus.CLOSED, closed.getStatus());
    }

    @Test
    void shouldRejectCloseAccountWithBalance() {
        Account saved = accountRepository.save(testAccount);
        
        assertThrows(IllegalStateException.class, () -> {
            accountService.closeAccount(saved.getAccountId());
        });
    }

    @Test
    void shouldGetAccountsByCustomerId() {
        accountRepository.save(testAccount);
        
        List<Account> accounts = accountService.getAccountsByCustomerId(999L);
        
        assertFalse(accounts.isEmpty());
    }
}
