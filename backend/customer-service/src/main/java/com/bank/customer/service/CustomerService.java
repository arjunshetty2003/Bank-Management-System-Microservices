package com.bank.customer.service;

import com.bank.customer.entity.Customer;
import com.bank.customer.exception.CustomerNotFoundException;
import com.bank.customer.exception.DuplicateEmailException;
import com.bank.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {
    private final CustomerRepository customerRepository;

    public Customer createCustomer(Customer customer) {
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new DuplicateEmailException("Email already exists: " + customer.getEmail());
        }
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = getCustomerById(id);
        if (!customer.getEmail().equals(customerDetails.getEmail()) 
                && customerRepository.existsByEmail(customerDetails.getEmail())) {
            throw new DuplicateEmailException("Email already exists: " + customerDetails.getEmail());
        }
        if (customerDetails.getUsername() != null && !customerDetails.getUsername().equals(customer.getUsername())
                && customerRepository.existsByUsername(customerDetails.getUsername())) {
            throw new DuplicateEmailException("Username already linked to another customer: " + customerDetails.getUsername());
        }
        customer.setUsername(customerDetails.getUsername());
        customer.setName(customerDetails.getName());
        customer.setEmail(customerDetails.getEmail());
        customer.setPhone(customerDetails.getPhone());
        customer.setAddress(customerDetails.getAddress());
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        // Soft delete - set status to INACTIVE
        Customer customer = getCustomerById(id);
        customer.setStatus(Customer.CustomerStatus.INACTIVE);
        customerRepository.save(customer);
    }

    public Customer updateCustomerStatus(Long id, String status) {
        Customer customer = getCustomerById(id);
        try {
            customer.setStatus(Customer.CustomerStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Must be ACTIVE, INACTIVE, or SUSPENDED");
        }
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerByUsername(String username) {
        return customerRepository.findByUsername(username)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found for user: " + username));
    }
}
