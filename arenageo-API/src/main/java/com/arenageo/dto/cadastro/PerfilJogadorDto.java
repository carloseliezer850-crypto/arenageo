package com.arenageo.dto.cadastro;

import com.arenageo.dto.cadastro.CadastroJogadorRequestDto.EsporteJogadorDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PerfilJogadorDto(
    @NotBlank @Size(max = 160, message = "Limite máximo: 160.") String name,
    @Size(max = 20, message = "Limite máximo: 20.") String phone,
    @NotNull @Valid EnderecoCadastroDto address,
    @NotEmpty @Size(max = 50, message = "Limite máximo: 50.")
        List<@NotNull @Valid EsporteJogadorDto> sports) {}
