package com.arenageo.controller;

import com.arenageo.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
public class ComunicacaoController {
  private final ConviteService convites;
  private final NotificacaoService avisos;

  public ComunicacaoController(ConviteService c, NotificacaoService n) {
    convites = c;
    avisos = n;
  }

  public record Invite(@NotBlank @Size(max = 50) String username) {}

  public record Answer(@NotBlank @Pattern(regexp = "ACEITAR|RECUSAR|REVOGAR") String action) {}

  @GetMapping("/notificacoes")
  public Object inbox(Principal p, @RequestParam(defaultValue = "0") int page) {
    return avisos.listar(Integer.parseInt(p.getName()), page);
  }

  @PutMapping("/notificacoes/{id}/lida")
  public void read(Principal p, @PathVariable long id) {
    avisos.ler(Integer.parseInt(p.getName()), id);
  }

  @GetMapping("/convites")
  public Object invites(Principal p) {
    return convites.meus(Integer.parseInt(p.getName()));
  }

  @GetMapping("/partidas/{id}/convites")
  public Object sent(Principal p, @PathVariable long id) {
    return convites.enviados(Integer.parseInt(p.getName()), id);
  }

  @PostMapping("/partidas/{id}/convites")
  public Object invite(Principal p, @PathVariable long id, @Valid @RequestBody Invite d) {
    return convites.convidar(Integer.parseInt(p.getName()), id, d.username());
  }

  @PostMapping("/convites/{id}/resposta")
  public Object answer(Principal p, @PathVariable long id, @Valid @RequestBody Answer d) {
    return convites.responder(Integer.parseInt(p.getName()), id, d.action());
  }
}
