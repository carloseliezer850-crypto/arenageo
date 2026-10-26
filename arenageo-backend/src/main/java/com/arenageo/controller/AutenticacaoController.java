package com.arenageo.controller;

import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.auth.LoginRequestDto;
import com.arenageo.service.AutenticacaoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class AutenticacaoController {
    private final AutenticacaoService autenticacaoService;

    public AutenticacaoController(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    @PostMapping("/entrar")
    public ResponseEntity<AuthResponseDto<Void>> entrar(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(autenticacaoService.entrar(request));
    }
}
