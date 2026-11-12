package com.arenageo.controller;

import com.arenageo.dto.cadastro.CadastroJogadorRequestDto;
import com.arenageo.service.CadastroJogadorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jogadores")
public class CadastroJogadorController {
  private final CadastroJogadorService cadastroJogadorService;
  private final com.arenageo.service.IdempotenciaService idempotencia;

  public CadastroJogadorController(
      CadastroJogadorService cadastroJogadorService,
      com.arenageo.service.IdempotenciaService idempotencia) {
    this.idempotencia = idempotencia;
    this.cadastroJogadorService = cadastroJogadorService;
  }

  @PostMapping
  public ResponseEntity<?> cadastrar(
      @RequestHeader(value = "Idempotency-Key", required = false) String key,
      @Valid @RequestBody CadastroJogadorRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            idempotencia.executar(
                key, "Jogador", request, () -> cadastroJogadorService.cadastrar(request)));
  }
}
