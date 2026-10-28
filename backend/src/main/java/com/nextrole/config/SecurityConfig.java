package com.nextrole.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final AppProperties appProperties;
    private final CorsConfig corsConfig;

    /**
     * Simple in-memory rate limiter: tracks login attempt counts per IP per minute window.
     * key = "IP:windowMinute", value = attempt count
     */
    private final Map<String, AtomicInteger> loginAttempts = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS_PER_MINUTE = 5;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        String encodedPassword = passwordEncoder().encode(appProperties.getAdmin().getPassword());
        var adminUser = User.withUsername(appProperties.getAdmin().getUsername())
                .password(encodedPassword)
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(adminUser);
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();

        http
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository)
                .csrfTokenRequestHandler(csrfHandler)
                .ignoringRequestMatchers("/api/admin/auth/login", "/api/admin/auth/logout")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "GET", "/api/jobs/**",
                    "/api/companies/**",
                    "/api/job-categories",
                    "/api/sources/public",
                    "/api/health",
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()
                .requestMatchers("POST", "/api/admin/auth/login").permitAll()
                .requestMatchers("/api/admin/auth/**").authenticated()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(loginRateLimitFilter(), UsernamePasswordAuthenticationFilter.class)
            .sessionManagement(session -> session
                .maximumSessions(5)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"Access denied\"}");
                })
            );

        return http.build();
    }

    /**
     * Creates a servlet filter that rate-limits POST /api/admin/auth/login to 5 attempts per IP per minute.
     */
    private jakarta.servlet.Filter loginRateLimitFilter() {
        return (request, response, chain) -> {
            HttpServletRequest httpReq = (HttpServletRequest) request;
            HttpServletResponse httpResp = (HttpServletResponse) response;

            if ("POST".equalsIgnoreCase(httpReq.getMethod())
                    && "/api/admin/auth/login".equals(httpReq.getRequestURI())) {

                String ip = getClientIp(httpReq);
                long currentMinute = Instant.now().getEpochSecond() / 60;
                String key = ip + ":" + currentMinute;

                // Clean old keys (basic cleanup on each request to prevent unbounded growth)
                loginAttempts.entrySet().removeIf(e -> {
                    try {
                        String[] parts = e.getKey().split(":");
                        long entryMinute = Long.parseLong(parts[parts.length - 1]);
                        return currentMinute - entryMinute > 2;
                    } catch (Exception ex) {
                        return true;
                    }
                });

                AtomicInteger counter = loginAttempts.computeIfAbsent(key, k -> new AtomicInteger(0));
                int attempts = counter.incrementAndGet();

                if (attempts > MAX_ATTEMPTS_PER_MINUTE) {
                    log.warn("Rate limit exceeded for login from IP: {}", ip);
                    httpResp.setStatus(429);
                    httpResp.setContentType("application/json");
                    httpResp.getWriter().write("{\"error\":\"Too Many Requests\",\"message\":\"Login rate limit exceeded. Try again in a minute.\"}");
                    return;
                }
            }
            chain.doFilter(request, response);
        };
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
