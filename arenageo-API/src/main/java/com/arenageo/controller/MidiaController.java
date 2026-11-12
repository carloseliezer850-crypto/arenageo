package com.arenageo.controller;

import com.arenageo.service.MidiaService;
import java.security.Principal;
import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/midias")
public class MidiaController {
  private final MidiaService service;

  public MidiaController(MidiaService s) {
    service = s;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Object enviar(
      Principal p,
      @RequestParam MultipartFile file,
      @RequestParam(required = false) Integer arena) {
    return service.salvar(Integer.valueOf(p.getName()), arena, file);
  }

  @GetMapping
  public Object listar(Principal p, @RequestParam(required = false) Integer arena) {
    return service.listar(Integer.valueOf(p.getName()), arena);
  }

  @GetMapping("/{id}")
  public ResponseEntity<byte[]> ler(Principal p, @PathVariable UUID id) {
    return ResponseEntity.ok()
        .contentType(MediaType.IMAGE_PNG)
        .header("X-Content-Type-Options", "nosniff")
        .cacheControl(CacheControl.noStore())
        .body(service.ler(Integer.valueOf(p.getName()), id));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void excluir(Principal p, @PathVariable UUID id) {
    service.excluir(Integer.valueOf(p.getName()), id);
  }

  @PutMapping("/ordem/{arena}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void ordem(Principal p, @PathVariable Integer arena, @RequestBody List<UUID> ids) {
    service.ordenar(Integer.valueOf(p.getName()), arena, ids);
  }
}
