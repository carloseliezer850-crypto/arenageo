package com.arenageo.dto.reserva;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.UUID;

public final class ReservaDtos {
  private ReservaDtos() {}

  public record Config(
      boolean online,
      @Min(1) @Max(10000000) int hourlyCents,
      @Min(30) @Max(240) int durationMinutes,
      @Min(0) @Max(120) int preparationMinutes,
      @Min(0) @Max(720) int cancellationHours,
      @NotBlank @Size(min = 10, max = 1000) String policy,
      @Min(0) int version) {}

  public record Quote(@Positive long spaceId, @NotNull LocalDateTime start) {}

  public record Confirm(
      @NotNull UUID quoteId,
      @AssertTrue(message = "Aceite as condições da reserva.") boolean accepted) {}

  public record Action(
      @NotBlank @Pattern(regexp = "CANCELAR|CHECKIN|CONCLUIR|FALTA|RECEBER_LOCAL") String action,
      @Min(0) int version,
      @Size(max = 500) String reason) {}

  public record Block(
      @Positive long spaceId,
      @NotNull LocalDateTime start,
      @NotNull LocalDateTime end,
      @NotBlank @Size(min = 5, max = 500) String reason) {}
}
