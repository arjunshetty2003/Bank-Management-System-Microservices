package com.bank.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    private Long customerId;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String status;
}
