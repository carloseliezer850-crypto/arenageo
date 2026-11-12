package com.arenageo.dto.cadastro;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record NovaArenaDto(
    @NotNull @Valid CadastroEmpresaRequestDto.ArenaDto arena,
    @NotNull @Valid EnderecoCadastroDto address) {}
