package com.arenageo.api.erro.dto;

import java.time.OffsetDateTime;
import java.util.Map;

public record ErroApiDto(OffsetDateTime timestamp, int status, String error, String message, Map<String, String> fields) {}
