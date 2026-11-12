package com.arenageo.exception;

import java.util.Map;

public class CadastroDuplicadoException extends RuntimeException {
  private final String code;
  private final Map<String, String> fields;

  public CadastroDuplicadoException(String message) {
    this("ACCOUNT_CONFLICT", null, message);
  }

  public CadastroDuplicadoException(String code, String field, String message) {
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
