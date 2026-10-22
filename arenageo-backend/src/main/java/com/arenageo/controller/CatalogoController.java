package com.arenageo.controller;

import java.util.List;
import com.arenageo.dto.catalogo.EsporteResponseDto;
import com.arenageo.dto.catalogo.NivelHabilidadeResponseDto;
import com.arenageo.service.CatalogoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CatalogoController {
    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping("/esportes")
    public ResponseEntity<List<EsporteResponseDto>> listarEsportes() {
        return ResponseEntity.ok(catalogoService.listarEsportes());
    }

    @GetMapping("/niveis")
    public ResponseEntity<List<NivelHabilidadeResponseDto>> listarNiveis() {
        return ResponseEntity.ok(catalogoService.listarNiveis());
    }
}
