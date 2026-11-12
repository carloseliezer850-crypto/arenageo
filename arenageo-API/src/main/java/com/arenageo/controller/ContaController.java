package com.arenageo.controller;

import com.arenageo.service.ContaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conta")
public class ContaController {
  private final ContaService service;

  public ContaController(ContaService s) {
    service = s;
  }

  public record Email(
      @NotBlank @jakarta.validation.constraints.Email @Size(max = 254) String email) {}

  public record Token(@NotBlank @Size(max = 100) String token, @Size(max = 72) String password) {}

  @PostMapping("/recuperar")
  public Object recuperar(@Valid @RequestBody Email d) {
    service.recuperar(d.email());
    return Map.of(
        "message",
        "Solicitação recebida. Se a conta existir e o envio estiver disponível, você receberá"
            + " instruções.");
  }

  @PostMapping("/redefinir")
  public Object redefinir(@Valid @RequestBody Token d) {
    service.consumir(d.token(), "RESET", d.password());
    return Map.of("message", "Senha atualizada. Entre novamente.");
  }

  @PostMapping("/confirmar")
  public Object confirmar(@Valid @RequestBody Token d) {
    service.consumir(d.token(), "VERIFY", null);
    return Map.of("message", "E-mail confirmado.");
  }

  @PostMapping("/reenviar")
  public Object reenviar(Principal p) {
    service.emitir(Integer.valueOf(p.getName()), "VERIFY");
    return Map.of(
        "message",
        "Solicitação recebida. Confira sua caixa de entrada; aguarde um minuto antes de pedir outro"
            + " envio.");
  }

  @GetMapping
  public Object estado(Principal p) {
    return service.estado(Integer.valueOf(p.getName()));
  }
}
