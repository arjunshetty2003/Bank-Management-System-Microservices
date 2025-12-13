package com.bank.account.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${services.customer-service.url}")
    private String customerServiceUrl;

    @Bean
    public WebClient customerServiceWebClient() {
        return WebClient.builder()
                .baseUrl(customerServiceUrl)
                .build();
    }
}
