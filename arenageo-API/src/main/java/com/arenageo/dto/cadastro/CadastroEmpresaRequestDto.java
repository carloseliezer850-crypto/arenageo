package com.arenageo.dto.cadastro;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record CadastroEmpresaRequestDto(
    @NotNull(message = "Campo obrigatório.") @Valid ResponsavelDto responsible,
    @NotNull(message = "Campo obrigatório.") @Valid EmpresaDto company,
    @NotNull(message = "Campo obrigatório.") @Valid EnderecoCadastroDto address,
    @NotNull(message = "Campo obrigatório.") @Valid ArenaDto arena
) {
    public record EmpresaDaContaDto(
        @NotNull(message = "Campo obrigatório.") @Valid EmpresaDto company,
        @NotNull(message = "Campo obrigatório.") @Valid EnderecoCadastroDto address,
        @NotNull(message = "Campo obrigatório.") @Valid ArenaDto arena
    ) {}

    public record ResponsavelDto(
        @NotBlank(message = "Campo obrigatório.") @Size(max = 160) String name,
        @NotBlank(message = "Campo obrigatório.") @Size(max = 18) @Pattern(regexp = "^(?:[0-9]{11}|[0-9]{3}[.][0-9]{3}[.][0-9]{3}-[0-9]{2})$") String cpf,
        @NotBlank(message = "Campo obrigatório.") @Email(message = "Informe um e-mail válido.") @Size(max = 254) String email,
        @NotBlank(message = "Campo obrigatório.") @Size(max = 20) String phone,
        @NotBlank(message = "Campo obrigatório.") @Size(min = 8, max = 72, message = "Senha deve ter entre 8 e 72 caracteres.") String password
    ) {}
    public record EmpresaDto(
        @NotBlank(message = "Campo obrigatório.") @Size(max = 180) String legalName,
        @NotBlank(message = "Campo obrigatório.") @Size(max = 180) String tradeName,
        @NotBlank(message = "Campo obrigatório.") @Size(max = 18) @Pattern(regexp = "^(?:[0-9]{14}|[0-9]{2}[.][0-9]{3}[.][0-9]{3}/[0-9]{4}-[0-9]{2})$") String cnpj,
        @Size(max = 30) String stateRegistration,
        @NotBlank(message = "Campo obrigatório.") @Size(max = 20) String businessPhone,
        @NotBlank(message = "Campo obrigatório.") @Email(message = "Informe um e-mail válido.") @Size(max = 254) String businessEmail
    ) {}
    public record ArenaDto(
        @NotBlank(message = "Campo obrigatório.") @Size(max = 160) String name,
        @Size(max = 10000) String description,
        @Size(max = 500) String imageUrl,
        @NotBlank(message = "Campo obrigatório.") @Size(max = 20) String phone,
        @NotBlank(message = "Campo obrigatório.") @Email(message = "Informe um e-mail válido.") @Size(max = 254) String email,
        @Size(max = 500) String website,
        @Size(max = 120) String instagram,
        @Size(max = 5000) String openingHours
    ) {}
}
