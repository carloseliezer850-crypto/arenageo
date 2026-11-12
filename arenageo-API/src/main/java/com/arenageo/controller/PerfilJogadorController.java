package com.arenageo.controller;

import com.arenageo.dto.cadastro.PerfilJogadorDto;
import com.arenageo.service.PerfilJogadorService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jogadores/me")
public class PerfilJogadorController {
  private final PerfilJogadorService service;

  public PerfilJogadorController(PerfilJogadorService s) {
    service = s;
  }

  @GetMapping
  public PerfilJogadorDto ler(Principal p) {
    return service.ler(Integer.valueOf(p.getName()));
  }

  @PutMapping
  public PerfilJogadorDto salvar(Principal p, @Valid @RequestBody PerfilJogadorDto d) {
    return service.salvar(Integer.valueOf(p.getName()), d);
  }
}
