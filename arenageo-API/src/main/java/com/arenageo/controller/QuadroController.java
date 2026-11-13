package com.arenageo.controller;

import com.arenageo.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.Principal;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/quadros")
public class QuadroController {
  private final QuadroService service;
  private final IdempotenciaService idem;

  public QuadroController(QuadroService s, IdempotenciaService i) {
    service = s;
    idem = i;
  }

  public record Save(
      @NotBlank @Size(max = 120) String title, @NotNull JsonNode document, @Min(0) int revision) {}

  public record Archive(@Min(0) int revision, boolean archived) {}

  @GetMapping
  public Object list(
      Principal p,
      @RequestParam(defaultValue = "") String query,
      @RequestParam(defaultValue = "false") boolean archived) {
    return service.list(Integer.parseInt(p.getName()), query, archived);
  }

  @GetMapping("/{id}")
  public Object read(Principal p, @PathVariable UUID id) {
    return service.read(Integer.parseInt(p.getName()), id);
  }

  @PostMapping
  public Object create(
      Principal p, @RequestHeader("Idempotency-Key") String key, @Valid @RequestBody Save s) {
    return idem.executar(
        key,
        "Quadro:" + p.getName(),
        s,
        () ->
            service.save(
                Integer.parseInt(p.getName()),
                UUID.randomUUID(),
                s.title(),
                s.document(),
                0,
                true));
  }

  @PutMapping("/{id}")
  public Object save(
      Principal p,
      @PathVariable UUID id,
      @RequestHeader("Idempotency-Key") String key,
      @Valid @RequestBody Save s) {
    return idem.executar(
        key,
        "Quadro:" + p.getName() + ":" + id,
        s,
        () ->
            service.save(
                Integer.parseInt(p.getName()), id, s.title(), s.document(), s.revision(), false));
  }

  @PatchMapping("/{id}")
  public Object archive(Principal p, @PathVariable UUID id, @Valid @RequestBody Archive a) {
    service.archive(Integer.parseInt(p.getName()), id, a.revision(), a.archived());
    return service.read(Integer.parseInt(p.getName()), id);
  }

  @DeleteMapping("/{id}")
  public void delete(Principal p, @PathVariable UUID id, @RequestParam int revision) {
    service.delete(Integer.parseInt(p.getName()), id, revision);
  }
}
