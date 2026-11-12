package com.arenageo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDto(
    @NotBlank(message = "Campo obrigatório.") @Email(message = "Informe um e-mail válido.") @Size(max = 254) String email,
    @NotBlank(message = "Campo obrigatório.") @Size(max = 72) String password,
    boolean rememberMe
) {}
