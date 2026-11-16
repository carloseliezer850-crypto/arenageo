package com.arenageo.controller;

import com.arenageo.service.CompartilhamentoQuadroService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.security.Principal;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CompartilhamentoQuadroController {
  private final CompartilhamentoQuadroService service;

  public CompartilhamentoQuadroController(CompartilhamentoQuadroService service) {
    this.service = service;
  }

  public record Share(@Min(0) int revision, boolean names) {}

  @GetMapping("/quadros/{id}/compartilhamento")
  public Object status(Principal p, @PathVariable UUID id) {
    return service.status(Integer.parseInt(p.getName()), id);
  }

  @PostMapping("/quadros/{id}/compartilhamento")
  public Object create(Principal p, @PathVariable UUID id, @Valid @RequestBody Share s) {
    return service.create(Integer.parseInt(p.getName()), id, s.revision(), s.names());
  }

  @DeleteMapping("/quadros/{id}/compartilhamento")
  public ResponseEntity<Void> revoke(Principal p, @PathVariable UUID id) {
    service.revoke(Integer.parseInt(p.getName()), id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/quadros-compartilhados/{token}")
  public ResponseEntity<Object> read(@PathVariable String token) {
    return ResponseEntity.ok()
        .header("Cache-Control", "no-store")
        .header("Referrer-Policy", "no-referrer")
        .header("X-Robots-Tag", "noindex, nofollow")
        .body(service.read(token));
  }
}
