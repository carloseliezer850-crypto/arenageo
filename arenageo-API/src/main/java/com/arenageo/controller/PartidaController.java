package com.arenageo.controller;

import com.arenageo.dto.partida.PartidaRequest;
import com.arenageo.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/partidas")
public class PartidaController {
  private final PartidaService service;
  private final IdempotenciaService idem;

  public PartidaController(PartidaService s, IdempotenciaService i) {
    service = s;
    idem = i;
  }

  @GetMapping
  public Object buscar(
      @RequestParam(defaultValue = "") String cidade,
      @RequestParam(defaultValue = "") String uf,
      @RequestParam(required = false) Integer esporte,
      @RequestParam(required = false) Integer nivel,
      @RequestParam(required = false) LocalDate data,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "12") int size) {
    return service.buscar(cidade, uf, esporte, nivel, data, page, size);
  }

  @GetMapping("/{id}")
  public Object detalhe(@PathVariable long id, Principal p) {
    return service.detalhe(id, p == null ? null : Integer.valueOf(p.getName()));
  }

  @GetMapping("/minhas")
  public Object minhas(Principal p) {
    return service.minhas(Integer.parseInt(p.getName()));
  }

  @PostMapping
  public Object criar(
      Principal p,
      @RequestHeader("Idempotency-Key") String key,
      @Valid @RequestBody PartidaRequest body) {
    return idem.executar(
        key,
        "Partida:" + p.getName(),
        body,
        () -> service.criar(Integer.parseInt(p.getName()), body));
  }

  @PutMapping("/{id}/participacao")
  public Object participar(Principal p, @PathVariable long id, @Valid @RequestBody Participacao d) {
    return service.participar(id, Integer.parseInt(p.getName()), d.leave());
  }

  @PostMapping("/{id}/estado")
  public Object estado(Principal p, @PathVariable long id, @Valid @RequestBody Estado d) {
    return service.transicao(
        id, Integer.parseInt(p.getName()), d.status(), d.version(), d.reason());
  }

  public record Participacao(boolean leave) {}

  public record Estado(
      @NotBlank @Pattern(regexp = "PUBLICADA|CANCELADA|CONCLUIDA") String status,
      @Min(0) int version,
      @Size(max = 500) String reason) {}
}
