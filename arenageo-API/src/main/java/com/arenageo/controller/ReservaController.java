package com.arenageo.controller;

import com.arenageo.dto.reserva.ReservaDtos.*;
import com.arenageo.service.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.*;

@RestController
public class ReservaController {
  private final ReservaService service;
  private final IdempotenciaService idem;

  public ReservaController(ReservaService s, IdempotenciaService i) {
    service = s;
    idem = i;
  }

  @GetMapping("/arenas/{id}/espacos")
  public Object spaces(@PathVariable int id) {
    return service.spaces(id);
  }

  @GetMapping("/espacos/{id}/disponibilidade")
  public Object availability(@PathVariable long id, @RequestParam LocalDate date) {
    return service.availability(id, date);
  }

  @GetMapping("/gestao/espacos/{id}/reservas-config")
  public Object config(Principal p, @PathVariable long id) {
    return service.readConfig(Integer.parseInt(p.getName()), id);
  }

  @PutMapping("/gestao/espacos/{id}/reservas-config")
  public Object config(Principal p, @PathVariable long id, @Valid @RequestBody Config c) {
    return service.saveConfig(Integer.parseInt(p.getName()), id, c);
  }

  @GetMapping("/gestao/arenas/{id}/agenda")
  public Object agenda(Principal p, @PathVariable int id, @RequestParam LocalDate date) {
    return service.agenda(Integer.parseInt(p.getName()), id, date);
  }

  @PostMapping("/gestao/bloqueios")
  public Object block(
      Principal p, @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Block b) {
    return idem.executar(
        key, "Bloqueio:" + p.getName(), b, () -> service.block(Integer.parseInt(p.getName()), b));
  }

  @PostMapping("/reservas/orcamentos")
  public Object quote(Principal p, @Valid @RequestBody Quote q) {
    return service.quote(Integer.parseInt(p.getName()), q);
  }

  @PostMapping("/reservas")
  public Object confirm(
      Principal p, @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Confirm c) {
    return idem.executar(
        key, "Reserva:" + p.getName(), c, () -> service.confirm(Integer.parseInt(p.getName()), c));
  }

  @GetMapping("/reservas")
  public Object mine(Principal p, @RequestParam(defaultValue = "0") int page) {
    return service.mine(Integer.parseInt(p.getName()), page);
  }

  @GetMapping("/reservas/{id}")
  public Object detail(Principal p, @PathVariable long id) {
    return service.detail(Integer.parseInt(p.getName()), id);
  }

  @PostMapping("/reservas/{id}/acoes")
  public Object action(Principal p, @PathVariable long id, @Valid @RequestBody Action a) {
    return service.action(Integer.parseInt(p.getName()), id, a);
  }
}
