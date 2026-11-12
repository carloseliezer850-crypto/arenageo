package com.arenageo.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class LimiteTentativasFilter extends OncePerRequestFilter {
  private record Janela(long minuto, int total) {}

  private final ConcurrentHashMap<String, Janela> counts = new ConcurrentHashMap<>();

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws IOException, ServletException {
    if (!"POST".equals(req.getMethod())
        || !java.util.Set.of(
                "/jogadores",
                "/empresas",
                "/usuarios/entrar",
                "/conta/recuperar",
                "/conta/redefinir",
                "/conta/confirmar",
                "/conta/reenviar")
            .contains(req.getServletPath())) {
      chain.doFilter(req, res);
      return;
    }
    long minute = System.currentTimeMillis() / 60000;
    counts.entrySet().removeIf(e -> e.getValue().minuto() < minute - 1);
    String key = req.getRemoteAddr() + ":" + req.getServletPath();
    var window =
        counts.compute(
            key,
            (k, v) ->
                v == null || v.minuto() != minute
                    ? new Janela(minute, 1)
                    : new Janela(minute, v.total() + 1));
    if (window.total() > 30 || counts.size() > 50000) {
      res.setStatus(429);
      res.setHeader("Retry-After", "60");
      res.setContentType("application/json;charset=UTF-8");
      res.getWriter()
          .write(
              "{\"status\":429,\"code\":\"RATE_LIMITED\",\"message\":\"Muitas tentativas. Aguarde"
                  + " um minuto.\",\"fields\":{},\"traceId\":\""
                  + java.util.UUID.randomUUID()
                  + "\"}");
      return;
    }
    chain.doFilter(req, res);
  }
}
