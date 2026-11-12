package com.arenageo.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenService jwtTokenService;
  private final org.springframework.jdbc.core.JdbcTemplate db;

  public JwtAuthenticationFilter(
      JwtTokenService jwtTokenService, org.springframework.jdbc.core.JdbcTemplate db) {
    this.db = db;
    this.jwtTokenService = jwtTokenService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String authorization = request.getHeader("Authorization");
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = authorization.substring(7).trim();
    try {
      Claims claims = jwtTokenService.validarToken(token);
      String subject = claims.getSubject();
      String accountType = claims.get("accountType", String.class);
      if (subject == null || accountType == null) {
        throw new IllegalArgumentException("Claims obrigatórias ausentes.");
      }
      Integer version = claims.get("sessionVersion", Integer.class);
      boolean valid =
          Boolean.TRUE.equals(
              db.queryForObject(
                  "select exists(select 1 from tb_usuario u join tb_tipo_conta t"
                      + " using(id_tipo_conta) where u.id_usuario=? and u.fl_ativo and t.fl_ativo"
                      + " and u.nr_sessao=?)",
                  Boolean.class,
                  Integer.valueOf(subject),
                  version == null ? 0 : version));
      if (!valid) throw new IllegalArgumentException("Sessão revogada.");
      var authentication =
          new UsernamePasswordAuthenticationToken(
              subject, null, List.of(new SimpleGrantedAuthority("ROLE_" + accountType)));
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (JwtException | IllegalArgumentException exception) {
      SecurityContextHolder.clearContext();
    }
    filterChain.doFilter(request, response);
  }
}
