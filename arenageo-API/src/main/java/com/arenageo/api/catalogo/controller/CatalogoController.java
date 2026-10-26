package com.arenageo.api.catalogo.controller;

import java.util.List;
import com.arenageo.api.catalogo.dto.EsporteResponseDto;
import com.arenageo.api.catalogo.dto.NivelHabilidadeResponseDto;
import com.arenageo.domain.catalogo.service.CatalogoService;
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
