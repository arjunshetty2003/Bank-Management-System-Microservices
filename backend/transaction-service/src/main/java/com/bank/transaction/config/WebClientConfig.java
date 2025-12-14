package com.bank.transaction.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient accountServiceWebClient(WebClient.Builder builder) {
        return builder.baseUrl("http://ACCOUNT-SERVICE").build();
    }

    @Bean
    public WebClient authServiceWebClient(WebClient.Builder builder) {
        return builder.baseUrl("http://AUTH-SERVICE").build();
    }
}
