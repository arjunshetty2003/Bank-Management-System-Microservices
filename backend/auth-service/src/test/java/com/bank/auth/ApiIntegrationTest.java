package com.bank.auth;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests that call running services via API Gateway.
 * Requires all services to be running on their respective ports.
 */
class ApiIntegrationTest {

    private static final String GATEWAY_URL = "http://localhost:8090";
    private final RestTemplate restTemplate = new RestTemplate();

    @Test
    void shouldLoginThroughGateway() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "bankadmin");
        loginRequest.put("password", "admin123");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            GATEWAY_URL + "/auth/login", entity, Map.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().get("token"));
        System.out.println("✓ Login successful, token received");
    }

    @Test
    void shouldGetCustomersThroughGatewayWithAuth() {
        // First login to get token
        String token = getAuthToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Object[]> response = restTemplate.exchange(
            GATEWAY_URL + "/customers", HttpMethod.GET, entity, Object[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        System.out.println("✓ Got " + response.getBody().length + " customers (with auth)");
    }

    @Test
    void shouldGetAccountsThroughGatewayWithAuth() {
        String token = getAuthToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Object[]> response = restTemplate.exchange(
            GATEWAY_URL + "/accounts", HttpMethod.GET, entity, Object[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        System.out.println("✓ Got " + response.getBody().length + " accounts (with auth)");
    }

    @Test
    void shouldGetTransactionsThroughGatewayWithAuth() {
        String token = getAuthToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Object[]> response = restTemplate.exchange(
            GATEWAY_URL + "/transactions/account/1", HttpMethod.GET, entity, Object[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        System.out.println("✓ Got transactions for account 1 (with auth)");
    }
    
    private String getAuthToken() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "bankadmin");
        loginRequest.put("password", "admin123");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            GATEWAY_URL + "/auth/login", entity, Map.class);
        
        return (String) response.getBody().get("token");
    }

    @Test
    void shouldTestFullRegistrationFlow() {
        // This tests: Auth Service → Customer Service → Account Service
        String uniqueUser = "testuser_" + System.currentTimeMillis();
        
        Map<String, Object> registerRequest = new HashMap<>();
        registerRequest.put("username", uniqueUser);
        registerRequest.put("password", "test123");
        registerRequest.put("name", "Integration Test User");
        registerRequest.put("email", uniqueUser + "@test.com");
        registerRequest.put("phone", "555-9999");
        registerRequest.put("address", "123 Test Street");
        registerRequest.put("accountType", "SAVINGS");
        registerRequest.put("initialDeposit", 100);
        registerRequest.put("transactionPin", "1234");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(registerRequest, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
            GATEWAY_URL + "/auth/register-full", entity, Map.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().get("token"));
        assertEquals(uniqueUser, response.getBody().get("username"));
        System.out.println("✓ Full registration flow successful (Auth → Customer → Account)");
    }
}
