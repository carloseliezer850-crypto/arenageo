package com.arenageo.api.empresa.dto;

import com.arenageo.api.cadastro.dto.EnderecoCadastroDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record CadastroEmpresaRequestDto(
    @NotNull @Valid ResponsavelDto responsible,
    @NotNull @Valid EmpresaDto company,
    @NotNull @Valid EnderecoCadastroDto address,
    @NotNull @Valid ArenaDto arena
) {
    public record ResponsavelDto(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 18) @Pattern(regexp = "^(?:[0-9]{11}|[0-9]{3}\\\\.[0-9]{3}\\\\.[0-9]{3}-[0-9]{2})$") String cpf,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Size(min = 8, max = 72, message = "Senha deve ter entre 8 e 72 caracteres.") String password
    ) {}
    public record EmpresaDto(
        @NotBlank @Size(max = 180) String legalName,
        @NotBlank @Size(max = 180) String tradeName,
        @NotBlank @Size(max = 18) @Pattern(regexp = "^(?:[0-9]{14}|[0-9]{2}\\\\.[0-9]{3}\\\\.[0-9]{3}/[0-9]{4}-[0-9]{2})$") String cnpj,
        @Size(max = 30) String stateRegistration,
        @NotBlank @Size(max = 20) String businessPhone,
        @NotBlank @Email @Size(max = 254) String businessEmail
    ) {}
    public record ArenaDto(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 10000) String description,
        @Size(max = 500) String imageUrl,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Email @Size(max = 254) String email,
        @Size(max = 500) String website,
        @Size(max = 120) String instagram,
        @Size(max = 5000) String openingHours
    ) {}
}
