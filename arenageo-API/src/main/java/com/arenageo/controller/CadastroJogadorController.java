package com.arenageo.controller;

import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.cadastro.CadastroJogadorRequestDto;
import com.arenageo.dto.cadastro.CadastroResultadoDto;
import com.arenageo.service.CadastroJogadorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jogadores")
public class CadastroJogadorController {
    private final CadastroJogadorService cadastroJogadorService;

    public CadastroJogadorController(CadastroJogadorService cadastroJogadorService) {
        this.cadastroJogadorService = cadastroJogadorService;
    }

    @PostMapping
    public ResponseEntity<AuthResponseDto<CadastroResultadoDto>> cadastrar(
            @Valid @RequestBody CadastroJogadorRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cadastroJogadorService.cadastrar(request));
    }
}
