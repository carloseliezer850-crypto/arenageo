package com.arenageo.controller;

import java.util.List;
import com.arenageo.dto.catalogo.ArenaResumoDto;
import com.arenageo.repository.ArenaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/arenas")
public class ArenaController {
    private final ArenaRepository arenaRepository;

    public ArenaController(ArenaRepository arenaRepository) {
        this.arenaRepository = arenaRepository;
    }

    @GetMapping
    public List<ArenaResumoDto> buscar(@RequestParam String cidade) {
        return arenaRepository.buscarPorCidade(cidade.trim());
    }
}
