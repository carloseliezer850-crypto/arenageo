package com.arenageo.dto.cadastro;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record CadastroEmpresaRequestDto(
    @NotNull(message = "Campo obrigatório.") @Valid ResponsavelDto responsible,
    @NotNull(message = "Campo obrigatório.") @Valid EmpresaDto company,
    @NotNull(message = "Campo obrigatório.") @Valid EnderecoCadastroDto address,
    @NotNull(message = "Campo obrigatório.") @Valid ArenaDto arena,
    @Valid EnderecoCadastroDto arenaAddress) {
  public record EmpresaDaContaDto(
      @NotNull(message = "Campo obrigatório.") @Valid EmpresaDto company,
      @NotNull(message = "Campo obrigatório.") @Valid EnderecoCadastroDto address,
      @NotNull(message = "Campo obrigatório.") @Valid ArenaDto arena,
      @Valid EnderecoCadastroDto arenaAddress) {}

  public record ResponsavelDto(
      @NotBlank(message = "Campo obrigatório.") @Size(max = 160, message = "Limite máximo: 160.")
          String name,
      @NotBlank(message = "Campo obrigatório.")
          @Size(max = 18, message = "Limite máximo: 18.")
          @Pattern(regexp = "^(?:[0-9]{11}|[0-9]{3}[.][0-9]{3}[.][0-9]{3}-[0-9]{2})$")
          String cpf,
      @NotBlank(message = "Campo obrigatório.")
          @Email(message = "Informe um e-mail válido.")
          @Size(max = 254, message = "Limite máximo: 254.")
          String email,
      @NotBlank(message = "Campo obrigatório.") @Size(max = 20, message = "Limite máximo: 20.")
          String phone,
      @NotBlank(message = "Campo obrigatório.")
          @Size(
              min = 12,
              max = 72,
              message = "Use pelo menos 12 caracteres e no máximo 72 bytes UTF-8.")
          String password) {
    public ResponsavelDto {
      name = name == null ? null : name.trim();
      email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
    }
  }

  public record EmpresaDto(
      @NotBlank(message = "Campo obrigatório.") @Size(max = 180, message = "Limite máximo: 180.")
          String legalName,
      @NotBlank(message = "Campo obrigatório.") @Size(max = 180, message = "Limite máximo: 180.")
          String tradeName,
      @NotBlank(message = "Campo obrigatório.")
          @Size(max = 18, message = "Limite máximo: 18.")
          @Pattern(
              regexp =
                  "^(?:[A-Za-z0-9]{12}[0-9]{2}|[A-Za-z0-9]{2}[.][A-Za-z0-9]{3}[.][A-Za-z0-9]{3}/[A-Za-z0-9]{4}-[0-9]{2})$")
          String cnpj,
      @Size(max = 30, message = "Limite máximo: 30.") String stateRegistration,
      @NotBlank(message = "Campo obrigatório.") @Size(max = 20, message = "Limite máximo: 20.")
          String businessPhone,
      @NotBlank(message = "Campo obrigatório.")
          @Email(message = "Informe um e-mail válido.")
          @Size(max = 254, message = "Limite máximo: 254.")
          String businessEmail) {
    public EmpresaDto {
      legalName = legalName == null ? null : legalName.trim();
      tradeName = tradeName == null ? null : tradeName.trim();
      businessEmail =
          businessEmail == null ? null : businessEmail.trim().toLowerCase(java.util.Locale.ROOT);
    }
  }

  public record ArenaDto(
      @NotBlank(message = "Campo obrigatório.") @Size(max = 160, message = "Limite máximo: 160.")
          String name,
      @Size(max = 10000, message = "Limite máximo: 10000.") String description,
      @Size(max = 500, message = "Limite máximo: 500.") String imageUrl,
      @NotBlank(message = "Campo obrigatório.") @Size(max = 20, message = "Limite máximo: 20.")
          String phone,
      @NotBlank(message = "Campo obrigatório.")
          @Email(message = "Informe um e-mail válido.")
          @Size(max = 254, message = "Limite máximo: 254.")
          String email,
      @Size(max = 500, message = "Limite máximo: 500.") String website,
      @Size(max = 120, message = "Limite máximo: 120.") String instagram,
      @Size(max = 5000, message = "Limite máximo: 5000.") String openingHours) {
    public ArenaDto {
      name = name == null ? null : name.trim();
      email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
    }
  }
}
