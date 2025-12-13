package com.bank.transaction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${services.account-service.url}")
    private String accountServiceUrl;

    @Bean
    public WebClient accountServiceWebClient() {
        return WebClient.builder()
                .baseUrl(accountServiceUrl)
                .build();
    }
}
