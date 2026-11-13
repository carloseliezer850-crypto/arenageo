package com.arenageo.dto.partida;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record PartidaRequest(
    @NotBlank @Size(min = 5, max = 120) String title,
    @NotNull @Positive Integer sportId,
    @NotNull @Positive Integer skillLevelId,
    @NotBlank @Size(max = 3000) String description,
    @NotBlank @Size(max = 200) String location,
    @NotBlank @Size(max = 120) String city,
    @NotBlank
        @Pattern(
            regexp =
                "AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO")
        String state,
    @NotNull LocalDateTime dateTime,
    @NotBlank @Size(max = 80) String timezone,
    @Min(15) @Max(480) int durationMinutes,
    @Min(2) @Max(100) int maxPlayers,
    boolean participate,
    boolean publish) {}
