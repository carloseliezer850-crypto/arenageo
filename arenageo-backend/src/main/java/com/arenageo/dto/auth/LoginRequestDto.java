package com.arenageo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDto(
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Size(max = 72) String password,
    boolean rememberMe
) {}
