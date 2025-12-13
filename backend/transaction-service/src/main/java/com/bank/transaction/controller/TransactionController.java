package com.bank.transaction.controller;

import com.bank.transaction.dto.DepositRequest;
import com.bank.transaction.dto.TransferRequest;
import com.bank.transaction.dto.WithdrawRequest;
import com.bank.transaction.entity.Transaction;
import com.bank.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {
    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<Transaction> deposit(@Valid @RequestBody DepositRequest request) {
        return new ResponseEntity<>(transactionService.deposit(request), HttpStatus.CREATED);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Transaction> withdraw(@Valid @RequestBody WithdrawRequest request) {
        return new ResponseEntity<>(transactionService.withdraw(request), HttpStatus.CREATED);
    }

    @PostMapping("/transfer")
    public ResponseEntity<Transaction> transfer(@Valid @RequestBody TransferRequest request) {
        return new ResponseEntity<>(transactionService.transfer(request), HttpStatus.CREATED);
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<Transaction>> getTransactionsByAccountId(@PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getTransactionsByAccountId(accountId));
    }
}
