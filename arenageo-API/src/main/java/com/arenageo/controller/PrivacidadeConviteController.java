package com.arenageo.controller;

import com.arenageo.service.PrivacidadeConviteService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/convites/privacidade")
public class PrivacidadeConviteController {
  private final PrivacidadeConviteService service;

  public PrivacidadeConviteController(PrivacidadeConviteService service) {
    this.service = service;
  }

  public record Preference(@NotNull Boolean enabled) {}

  public record Block(@NotBlank @Size(max = 50) String username) {}

  @GetMapping
  public Object read(Principal p) {
    return service.read(Integer.parseInt(p.getName()));
  }

  @PutMapping
  public ResponseEntity<Void> preference(Principal p, @Valid @RequestBody Preference body) {
    service.setEnabled(Integer.parseInt(p.getName()), body.enabled());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/bloqueios")
  public ResponseEntity<Void> block(Principal p, @Valid @RequestBody Block body) {
    service.block(Integer.parseInt(p.getName()), body.username());
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/bloqueios/{id}")
  public ResponseEntity<Void> unblock(Principal p, @PathVariable int id) {
    service.unblock(Integer.parseInt(p.getName()), id);
    return ResponseEntity.noContent().build();
  }
}
