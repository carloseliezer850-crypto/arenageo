package com.arenageo.exception;

import java.util.Map;

public class RegraNegocioException extends RuntimeException {
  private final String code;
  private final Map<String, String> fields;

  public RegraNegocioException(String message) {
    this("VALIDATION_ERROR", null, message);
  }

  public RegraNegocioException(String code, String field, String message) {
    super(message);
    this.code = code;
    this.fields = field == null ? Map.of() : Map.of(field, message);
  }

  public String getCode() {
    return code;
  }

  public Map<String, String> getFields() {
    return fields;
  }
}
