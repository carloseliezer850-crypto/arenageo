package com.arenageo.api.autenticacao.dto;

public record AuthResponseDto<T>(
    boolean success, String message, UsuarioAutenticadoDto user, T data, String token
) {}
