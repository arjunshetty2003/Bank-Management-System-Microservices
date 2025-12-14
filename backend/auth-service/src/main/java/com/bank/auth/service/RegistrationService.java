package com.bank.auth.service;

import com.bank.auth.dto.AuthResponse;
import com.bank.auth.dto.FullRegistrationRequest;
import com.bank.auth.entity.User;
import com.bank.auth.repository.UserRepository;
import com.bank.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final WebClient customerServiceWebClient;
    private final WebClient accountServiceWebClient;

    @Transactional
    public AuthResponse registerFull(FullRegistrationRequest request) {
        // 1. Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // 2. Validate PIN (must be 4 digits)
        if (!request.getTransactionPin().matches("\\d{4}")) {
            throw new RuntimeException("Transaction PIN must be 4 digits");
        }

        // 3. Create auth user
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .transactionPin(passwordEncoder.encode(request.getTransactionPin()))
                .role("USER")
                .build();
        userRepository.save(user);

        try {
            // 3. Create customer profile
            Map<String, Object> customerRequest = new HashMap<>();
            customerRequest.put("username", request.getUsername());
            customerRequest.put("name", request.getName());
            customerRequest.put("email", request.getEmail());
            customerRequest.put("phone", request.getPhone());
            customerRequest.put("address", request.getAddress());

            Map<String, Object> customer = customerServiceWebClient.post()
                    .uri("/customers")
                    .bodyValue(customerRequest)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response -> 
                        response.bodyToMono(String.class)
                            .flatMap(body -> Mono.error(new RuntimeException("Failed to create customer: " + body))))
                    .bodyToMono(Map.class)
                    .block();

            Long customerId = ((Number) customer.get("customerId")).longValue();

            // 4. Create default account
            Map<String, Object> accountRequest = new HashMap<>();
            accountRequest.put("customerId", customerId);
            accountRequest.put("accountType", request.getAccountType());
            accountRequest.put("initialBalance", request.getInitialDeposit());

            accountServiceWebClient.post()
                    .uri("/accounts")
                    .bodyValue(accountRequest)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                            .flatMap(body -> Mono.error(new RuntimeException("Failed to create account: " + body))))
                    .bodyToMono(Map.class)
                    .block();

        } catch (Exception e) {
            // Rollback user creation if customer/account creation fails
            userRepository.delete(user);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }

        // 5. Generate token and return
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new AuthResponse(token, user.getUsername(), user.getRole());
    }
}
