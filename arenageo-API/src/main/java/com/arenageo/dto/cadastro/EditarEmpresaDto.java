package com.arenageo.dto.cadastro;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record EditarEmpresaDto(
    @NotNull @Valid CadastroEmpresaRequestDto.EmpresaDto company,
    @NotNull @Valid EnderecoCadastroDto address) {}
