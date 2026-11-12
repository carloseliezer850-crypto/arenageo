package com.arenageo.dto.cadastro;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public record GestaoArenaDto(
    @NotNull @Valid CadastroEmpresaRequestDto.ArenaDto arena,
    @NotNull @Valid EnderecoCadastroDto address,
    @NotNull @Size(max = 50, message = "Limite máximo: 50.") List<@NotNull @Valid EspacoDto> spaces,
    @NotNull @Size(max = 42, message = "Limite máximo: 42.") List<@NotNull @Valid HorarioDto> hours,
    @NotBlank String timezone,
    @NotNull @Size(max = 365, message = "Limite máximo: 365.")
        List<@NotNull @Valid ExcecaoDto> exceptions,
    boolean publish) {
  public record EspacoDto(
      @NotBlank @Size(max = 120, message = "Limite máximo: 120.") String name,
      @NotEmpty @Size(max = 50, message = "Limite máximo: 50.") List<@NotNull Integer> sportIds,
      boolean covered,
      @Size(max = 80, message = "Limite máximo: 80.") String floor,
      @Min(1) @Max(100000) Integer capacity,
      @DecimalMin("0.1") @DecimalMax("10000") Double width,
      @DecimalMin("0.1") @DecimalMax("10000") Double length) {}

  public record HorarioDto(
      @Min(0) @Max(6) int day, @Min(0) @Max(1439) int start, @Min(1) @Max(2880) int end) {}

  public record ExcecaoDto(
      @NotNull LocalDate date,
      @NotNull @Size(max = 6, message = "Limite máximo: 6.")
          List<@NotNull @Valid PeriodoDto> periods) {}

  public record PeriodoDto(@Min(0) @Max(1439) int start, @Min(1) @Max(2880) int end) {}
}
