package com.arenageo.dto.cadastro;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record CadastroJogadorRequestDto(
    @NotNull(message = "Campo obrigatório.") @Valid DadosJogadorDto user,
    @NotNull(message = "Campo obrigatório.") @Valid EnderecoCadastroDto address,
    @NotEmpty(message = "Selecione pelo menos um esporte.")
        @Size(max = 50, message = "Limite máximo: 50.")
        List<@NotNull @Valid EsporteJogadorDto> sports) {
  public record DadosJogadorDto(
      @NotBlank(message = "Nome completo é obrigatório.")
          @Size(max = 160, message = "Limite máximo: 160.")
          String name,
      @NotBlank(message = "Nome de usuário é obrigatório.")
          @Pattern(
              regexp = "^[A-Za-z0-9._]{3,30}$",
              message =
                  "Nome de usuário deve ter de 3 a 30 caracteres: letras, números, ponto ou"
                      + " sublinhado.")
          String username,
      @NotBlank(message = "Campo obrigatório.")
          @Email(message = "Informe um e-mail válido.")
          @Size(max = 254, message = "Limite máximo: 254.")
          String email,
      @Size(max = 500, message = "Limite máximo: 500.") String profileImageUrl,
      @Size(max = 20, message = "Limite máximo: 20.") String phone,
      @NotBlank(message = "CPF é obrigatório.")
          @Size(max = 18, message = "Limite máximo: 18.")
          @Pattern(regexp = "^(?:[0-9]{11}|[0-9]{3}[.][0-9]{3}[.][0-9]{3}-[0-9]{2})$")
          String cpf,
      @Pattern(
              regexp = "^$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
              message = "Data de nascimento deve estar no formato AAAA-MM-DD.")
          String birthDate,
      @NotBlank(message = "Campo obrigatório.")
          @Size(
              min = 12,
              max = 72,
              message = "Use pelo menos 12 caracteres e no máximo 72 bytes UTF-8.")
          String password) {
    public DadosJogadorDto {
      name = name == null ? null : name.trim();
      username = username == null ? null : username.trim().toLowerCase(java.util.Locale.ROOT);
      email = email == null ? null : email.trim().toLowerCase(java.util.Locale.ROOT);
    }
  }

  public record EsporteJogadorDto(
      @NotNull(message = "Campo obrigatório.") Integer sportId,
      @NotNull(message = "Campo obrigatório.") Integer skillLevelId) {}
}
