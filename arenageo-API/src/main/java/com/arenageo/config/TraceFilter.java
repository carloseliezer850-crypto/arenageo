package com.arenageo.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class TraceFilter extends OncePerRequestFilter {
  public static String current() {
    var a = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
    if (a instanceof org.springframework.web.context.request.ServletRequestAttributes r
        && r.getRequest().getAttribute("traceId") instanceof String id) return id;
    return UUID.randomUUID().toString();
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws IOException, ServletException {
    String id = UUID.randomUUID().toString();
    req.setAttribute("traceId", id);
    res.setHeader("X-Trace-Id", id);
    org.slf4j.MDC.put("traceId", id);
    try {
      chain.doFilter(req, res);
    } finally {
      org.slf4j.MDC.remove("traceId");
    }
  }
}
