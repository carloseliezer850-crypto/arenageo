package com.arenageo.controller;

import com.arenageo.service.DescobertaJogadorService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.*;

@RestController
public class DescobertaJogadorController {
  private final DescobertaJogadorService service;

  public DescobertaJogadorController(DescobertaJogadorService service) {
    this.service = service;
  }

  @GetMapping("/jogadores")
  public Object search(
      @RequestParam(defaultValue = "") String query,
      @RequestParam(defaultValue = "") String city,
      @RequestParam(defaultValue = "") String state,
      @RequestParam(required = false) Integer sport,
      @RequestParam(required = false) Integer level,
      @RequestParam(required = false) LocalDate date,
      @RequestParam(defaultValue = "") String period,
      @RequestParam(defaultValue = "0") int page) {
    return service.search(query, city, state, sport, level, date, period, page);
  }

  @GetMapping("/jogadores/{id}")
  public Object detail(@PathVariable int id) {
    return service.detail(id);
  }

  @GetMapping("/jogadores/me/descoberta")
  public Object config(Principal p) {
    return service.config(Integer.parseInt(p.getName()));
  }

  @PutMapping("/jogadores/me/descoberta")
  public Object save(Principal p, @Valid @RequestBody DescobertaJogadorService.Config c) {
    return service.save(Integer.parseInt(p.getName()), c);
  }

  @GetMapping("/usuarios/sessao")
  public Object session(Principal p) {
    return java.util.Map.of("authenticated", true);
  }
}
