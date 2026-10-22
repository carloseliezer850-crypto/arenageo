package com.arenageo.controller;

import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.cadastro.CadastroEmpresaRequestDto;
import com.arenageo.dto.cadastro.CadastroResultadoDto;
import com.arenageo.service.CadastroEmpresaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/empresas")
public class CadastroEmpresaController {
    private final CadastroEmpresaService cadastroEmpresaService;

    public CadastroEmpresaController(CadastroEmpresaService cadastroEmpresaService) {
        this.cadastroEmpresaService = cadastroEmpresaService;
    }

    @PostMapping
    public ResponseEntity<AuthResponseDto<CadastroResultadoDto>> cadastrar(
            @Valid @RequestBody CadastroEmpresaRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastroEmpresaService.cadastrar(request));
    }
}
