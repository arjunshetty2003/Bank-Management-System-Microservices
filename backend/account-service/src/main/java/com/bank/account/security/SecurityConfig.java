package com.bank.account.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/accounts/number/**").permitAll()  // Internal service calls
                .requestMatchers(HttpMethod.GET, "/accounts/{id}").permitAll()  // Internal service calls (transaction validation)
                .requestMatchers(HttpMethod.GET, "/accounts/user/**").permitAll()  // User dashboard calls
                .requestMatchers(HttpMethod.GET, "/accounts/customer/**").permitAll()  // Customer account lookup
                .requestMatchers(HttpMethod.GET, "/accounts").permitAll()  // List all accounts
                .requestMatchers(HttpMethod.POST, "/accounts/{id}/deposit").permitAll()  // Internal transaction calls
                .requestMatchers(HttpMethod.POST, "/accounts/{id}/withdraw").permitAll()  // Internal transaction calls
                .requestMatchers(HttpMethod.POST, "/accounts").permitAll()  // Registration creates account
                .requestMatchers(HttpMethod.PUT, "/accounts/*/status").hasRole("ADMIN")  // Only admin can change status
                .requestMatchers(HttpMethod.PUT, "/accounts/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/accounts/**").permitAll()  // Users can close their own accounts (PIN validated in frontend)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
