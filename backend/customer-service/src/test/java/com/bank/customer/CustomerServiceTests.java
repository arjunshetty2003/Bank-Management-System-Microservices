package com.bank.customer;

import com.bank.customer.entity.Customer;
import com.bank.customer.repository.CustomerRepository;
import com.bank.customer.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CustomerServiceTests {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerService customerService;

    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        // Clean up test data
        customerRepository.findByEmail("junit_test@example.com").ifPresent(customerRepository::delete);
        
        // Create test customer
        testCustomer = Customer.builder()
                .username("junit_user")
                .name("JUnit Test User")
                .email("junit_test@example.com")
                .phone("555-0000")
                .address("123 Test Street")
                .status(Customer.CustomerStatus.ACTIVE)
                .build();
    }

    @Test
    void contextLoads() {
        assertNotNull(customerRepository);
        assertNotNull(customerService);
    }

    @Test
    void shouldSaveCustomer() {
        Customer saved = customerRepository.save(testCustomer);
        
        assertNotNull(saved.getCustomerId());
        assertEquals("JUnit Test User", saved.getName());
        assertEquals("junit_test@example.com", saved.getEmail());
        assertEquals(Customer.CustomerStatus.ACTIVE, saved.getStatus());
    }

    @Test
    void shouldFindCustomerByEmail() {
        customerRepository.save(testCustomer);
        
        Customer found = customerRepository.findByEmail("junit_test@example.com").orElse(null);
        
        assertNotNull(found);
        assertEquals("JUnit Test User", found.getName());
    }

    @Test
    void shouldGetAllCustomers() {
        customerRepository.save(testCustomer);
        
        List<Customer> customers = customerService.getAllCustomers();
        
        assertFalse(customers.isEmpty());
    }

    @Test
    void shouldUpdateCustomerStatus() {
        Customer saved = customerRepository.save(testCustomer);
        
        Customer updated = customerService.updateCustomerStatus(saved.getCustomerId(), "SUSPENDED");
        
        assertEquals(Customer.CustomerStatus.SUSPENDED, updated.getStatus());
    }

    @Test
    void shouldRejectInvalidStatus() {
        Customer saved = customerRepository.save(testCustomer);
        
        assertThrows(IllegalArgumentException.class, () -> {
            customerService.updateCustomerStatus(saved.getCustomerId(), "INVALID_STATUS");
        });
    }

    @Test
    void shouldSoftDeleteCustomer() {
        Customer saved = customerRepository.save(testCustomer);
        
        customerService.deleteCustomer(saved.getCustomerId());
        
        Customer deleted = customerRepository.findById(saved.getCustomerId()).orElseThrow();
        assertEquals(Customer.CustomerStatus.INACTIVE, deleted.getStatus());
    }

    @Test
    void shouldFindCustomerByUsername() {
        customerRepository.save(testCustomer);
        
        Customer found = customerRepository.findByUsername("junit_user").orElse(null);
        
        assertNotNull(found);
        assertEquals("junit_test@example.com", found.getEmail());
    }
}
