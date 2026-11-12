package com.arenageo.controller;

import com.arenageo.dto.cadastro.*;
import com.arenageo.service.*;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gestao")
public class GestaoArenaController {
  private final GestaoArenaService service;
  private final IdempotenciaService idem;

  public GestaoArenaController(GestaoArenaService s, IdempotenciaService i) {
    service = s;
    idem = i;
  }

  @GetMapping("/empresas")
  public Object empresas(Principal p) {
    return service.empresas(Integer.valueOf(p.getName()));
  }

  @GetMapping("/empresas/{id}")
  public Object empresa(Principal p, @PathVariable Integer id) {
    return service.lerEmpresa(Integer.valueOf(p.getName()), id);
  }

  @PutMapping("/empresas/{id}")
  public Object empresa(
      Principal p, @PathVariable Integer id, @Valid @RequestBody EditarEmpresaDto d) {
    return service.salvarEmpresa(Integer.valueOf(p.getName()), id, d);
  }

  @GetMapping("/arenas")
  public Object listar(Principal p) {
    return service.listar(Integer.valueOf(p.getName()));
  }

  @GetMapping("/arenas/{id}")
  public Object ler(Principal p, @PathVariable Integer id) {
    return service.ler(Integer.valueOf(p.getName()), id);
  }

  @PutMapping("/arenas/{id}")
  public Object salvar(
      Principal p, @PathVariable Integer id, @Valid @RequestBody GestaoArenaDto d) {
    return service.salvar(Integer.valueOf(p.getName()), id, d);
  }

  @PostMapping("/empresas/{id}/arenas")
  public Object criar(
      Principal p,
      @PathVariable Integer id,
      @RequestHeader(value = "Idempotency-Key", required = false) String key,
      @Valid @RequestBody NovaArenaDto d) {
    return idem.executar(
        key,
        "Arena:" + p.getName() + ":" + id,
        d,
        () -> service.criar(Integer.valueOf(p.getName()), id, d));
  }
}
