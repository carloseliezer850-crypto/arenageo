package com.arenageo.controller;

import com.arenageo.dto.catalogo.ArenaResumoDto;
import com.arenageo.repository.ArenaRepository;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/arenas")
public class ArenaController {
  private final ArenaRepository arenaRepository;

  public ArenaController(ArenaRepository arenaRepository) {
    this.arenaRepository = arenaRepository;
  }

  @GetMapping
  public List<ArenaResumoDto> buscar(
      @RequestParam String cidade, @RequestParam(required = false) String uf) {
    return arenaRepository.buscarPorCidade(
        cidade.trim(), uf == null ? null : uf.trim().toUpperCase(java.util.Locale.ROOT));
  }
}
