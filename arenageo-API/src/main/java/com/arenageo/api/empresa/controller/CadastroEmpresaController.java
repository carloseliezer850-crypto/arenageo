package com.arenageo.api.empresa.controller;

import com.arenageo.api.autenticacao.dto.AuthResponseDto;
import com.arenageo.api.empresa.dto.CadastroEmpresaRequestDto;
import com.arenageo.api.cadastro.dto.CadastroResultadoDto;
import com.arenageo.domain.empresa.service.CadastroEmpresaService;
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
