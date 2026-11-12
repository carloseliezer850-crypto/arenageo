package com.arenageo.controller;

import com.arenageo.dto.cadastro.CadastroEmpresaRequestDto;
import com.arenageo.service.CadastroEmpresaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/empresas")
public class CadastroEmpresaController {
  private final CadastroEmpresaService cadastroEmpresaService;
  private final com.arenageo.service.IdempotenciaService idempotencia;

  public CadastroEmpresaController(
      CadastroEmpresaService cadastroEmpresaService,
      com.arenageo.service.IdempotenciaService idempotencia) {
    this.idempotencia = idempotencia;
    this.cadastroEmpresaService = cadastroEmpresaService;
  }

  @PostMapping("/minha-conta")
  @ResponseStatus(HttpStatus.CREATED)
  public Object cadastrarNaConta(
      java.security.Principal principal,
      @RequestHeader(value = "Idempotency-Key", required = false) String key,
      @Valid @RequestBody CadastroEmpresaRequestDto.EmpresaDaContaDto request) {
    return idempotencia.executar(
        key,
        "Empresa:" + principal.getName(),
        request,
        () ->
            cadastroEmpresaService.cadastrarNaConta(Integer.valueOf(principal.getName()), request));
  }

  @PostMapping
  public ResponseEntity<?> cadastrar(
      @RequestHeader(value = "Idempotency-Key", required = false) String key,
      @Valid @RequestBody CadastroEmpresaRequestDto request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(
            idempotencia.executar(
                key, "Empresa", request, () -> cadastroEmpresaService.cadastrar(request)));
  }
}
