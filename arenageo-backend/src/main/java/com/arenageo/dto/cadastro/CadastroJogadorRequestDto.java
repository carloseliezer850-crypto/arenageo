package com.arenageo.dto.cadastro;

import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public record CadastroJogadorRequestDto(
    @NotNull @Valid DadosJogadorDto user,
    @NotNull @Valid EnderecoCadastroDto address,
    List<@Valid EsporteJogadorDto> sports
) {
    public record DadosJogadorDto(
        @NotBlank(message = "Nome completo é obrigatório.") @Size(max = 160) String name,
        @NotBlank(message = "Nome de usuário é obrigatório.")
        @Pattern(regexp = "^[A-Za-z0-9._]{3,30}$",
            message = "Nome de usuário deve ter de 3 a 30 caracteres: letras, números, ponto ou sublinhado.")
        String username,
        @NotBlank @Email @Size(max = 254) String email,
        @Size(max = 500) String profileImageUrl,
        @Size(max = 20) String phone,
        @NotBlank(message = "CPF é obrigatório.") @Size(max = 18) String cpf,
        @Pattern(regexp = "^$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
            message = "Data de nascimento deve estar no formato AAAA-MM-DD.")
        String birthDate,
        @NotBlank @Size(min = 8, max = 72, message = "Senha deve ter entre 8 e 72 caracteres.")
        String password
    ) {}
    public record EsporteJogadorDto(@NotNull Integer sportId, @NotNull Integer skillLevelId) {}
}
