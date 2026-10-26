package com.arenageo.api.jogador.controller;

import com.arenageo.api.autenticacao.dto.AuthResponseDto;
import com.arenageo.api.jogador.dto.CadastroJogadorRequestDto;
import com.arenageo.api.cadastro.dto.CadastroResultadoDto;
import com.arenageo.domain.jogador.service.CadastroJogadorService;
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
