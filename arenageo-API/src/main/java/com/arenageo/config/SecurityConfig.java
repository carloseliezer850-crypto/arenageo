package com.arenageo.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtAuthenticationFilter jwtAuthenticationFilter,
      CorsConfigurationSource corsConfigurationSource)
      throws Exception {

    http.csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource))
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            authorize ->
                authorize
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.POST,
                        "/jogadores",
                        "/empresas",
                        "/usuarios/entrar",
                        "/conta/recuperar",
                        "/conta/redefinir",
                        "/conta/confirmar")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/esportes", "/niveis")
                    .permitAll()
                    .requestMatchers("/error")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            errors ->
                errors
                    .authenticationEntryPoint(
                        (request, response, exception) ->
                            escreverErro(
                                response,
                                401,
                                "SESSION_EXPIRED",
                                "Sua sessão expirou. Entre novamente."))
                    .accessDeniedHandler(
                        (request, response, exception) ->
                            escreverErro(
                                response,
                                403,
                                "FORBIDDEN",
                                "Você não tem permissão para esta ação.")))
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  private static void escreverErro(
      jakarta.servlet.http.HttpServletResponse response, int status, String code, String message)
      throws java.io.IOException {
    response.setStatus(status);
    response.setContentType("application/json;charset=UTF-8");
    response
        .getWriter()
        .write(
            "{\"status\":"
                + status
                + ",\"code\":\""
                + code
                + "\",\"message\":\""
                + message
                + "\",\"fields\":{},\"traceId\":\""
                + java.util.UUID.randomUUID()
                + "\"}");
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource(
      @Value("${app.cors.allowed-origins}") String allowedOrigins) {

    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(
        Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList());
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(
        List.of("Authorization", "Content-Type", "Accept", "Origin", "Idempotency-Key"));
    configuration.setExposedHeaders(List.of("Authorization"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
