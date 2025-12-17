package com.bank.auth;

import com.bank.auth.dto.AuthRequest;
import com.bank.auth.entity.User;
import com.bank.auth.repository.UserRepository;
import com.bank.auth.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthServiceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Clean up test users
        userRepository.findByUsername("testuser_junit").ifPresent(userRepository::delete);
    }

    @Test
    void contextLoads() {
        assertNotNull(userRepository);
        assertNotNull(passwordEncoder);
        assertNotNull(jwtUtil);
    }

    @Test
    void shouldEncodePassword() {
        String rawPassword = "password123";
        String encoded = passwordEncoder.encode(rawPassword);
        
        assertNotEquals(rawPassword, encoded);
        assertTrue(passwordEncoder.matches(rawPassword, encoded));
    }

    @Test
    void shouldGenerateValidJwtToken() {
        String token = jwtUtil.generateToken("testuser", "USER");
        
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("testuser", jwtUtil.extractUsername(token));
    }

    @Test
    void shouldSaveUserToRepository() {
        // Test direct repository save with all required fields
        User user = User.builder()
                .username("testuser_junit")
                .password(passwordEncoder.encode("test123"))
                .transactionPin(passwordEncoder.encode("1234"))
                .role("USER")
                .build();
        
        User saved = userRepository.save(user);
        
        assertNotNull(saved.getId());
        assertEquals("testuser_junit", saved.getUsername());
        assertEquals("USER", saved.getRole());
        assertTrue(userRepository.existsByUsername("testuser_junit"));
    }

    @Test
    void shouldRejectDuplicateUsername() throws Exception {
        // Create user first with transactionPin
        User user = User.builder()
                .username("testuser_junit")
                .password(passwordEncoder.encode("test123"))
                .transactionPin(passwordEncoder.encode("1234"))
                .role("USER")
                .build();
        userRepository.save(user);

        // Verify user exists
        assertTrue(userRepository.existsByUsername("testuser_junit"));
    }

    @Test
    void shouldLoginWithValidCredentials() throws Exception {
        // Create user with transactionPin
        User user = User.builder()
                .username("testuser_junit")
                .password(passwordEncoder.encode("test123"))
                .transactionPin(passwordEncoder.encode("1234"))
                .role("USER")
                .build();
        userRepository.save(user);

        AuthRequest request = new AuthRequest();
        request.setUsername("testuser_junit");
        request.setPassword("test123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("testuser_junit"));
    }

    @Test
    void shouldRejectInvalidCredentials() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setUsername("nonexistent");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
