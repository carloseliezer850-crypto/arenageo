package com.arenageo.dto.auth;

public record AuthResponseDto<T>(
    boolean success, String message, UsuarioAutenticadoDto user, T data, String token
) {}
