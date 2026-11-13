package com.arenageo.exception;

import com.arenageo.dto.erro.ErroApiDto;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErroApiDto> tratarValidacao(MethodArgumentNotValidException exception) {
    Map<String, String> campos = new LinkedHashMap<>();
    for (FieldError erro : exception.getBindingResult().getFieldErrors()) {
      campos.putIfAbsent(erro.getField(), erro.getDefaultMessage());
    }
    return resposta(HttpStatus.BAD_REQUEST, "Existem campos inválidos na requisição.", campos);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErroApiDto> tratarCorpoInvalido(HttpMessageNotReadableException exception) {
    return resposta(HttpStatus.BAD_REQUEST, "O corpo da requisição está inválido.", Map.of());
  }

  @ExceptionHandler(CadastroDuplicadoException.class)
  public ResponseEntity<ErroApiDto> tratarDuplicidade(CadastroDuplicadoException exception) {
    return resposta(
        HttpStatus.CONFLICT, exception.getMessage(), exception.getFields(), exception.getCode());
  }

  @ExceptionHandler(RecursoNaoEncontradoException.class)
  public ResponseEntity<ErroApiDto> tratarNaoEncontrado(RecursoNaoEncontradoException exception) {
    return resposta(HttpStatus.NOT_FOUND, exception.getMessage(), Map.of());
  }

  @ExceptionHandler(RegraNegocioException.class)
  public ResponseEntity<ErroApiDto> tratarRegraNegocio(RegraNegocioException exception) {
    return resposta(
        HttpStatus.BAD_REQUEST, exception.getMessage(), exception.getFields(), exception.getCode());
  }

  @ExceptionHandler(CredenciaisInvalidasException.class)
  public ResponseEntity<ErroApiDto> tratarCredenciais(CredenciaisInvalidasException exception) {
    return resposta(HttpStatus.UNAUTHORIZED, exception.getMessage(), Map.of());
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErroApiDto> tratarIntegridade(DataIntegrityViolationException exception) {
    Throwable cause = exception;
    while (cause != null) {
      if (cause instanceof java.sql.SQLException sql && "23P01".equals(sql.getSQLState()))
        return resposta(
            HttpStatus.CONFLICT,
            "Este horário acabou de ser ocupado. Consulte a agenda novamente.",
            Map.of(),
            "BOOKING_CONFLICT");
      if (cause instanceof java.sql.SQLException sql && "23505".equals(sql.getSQLState()))
        return resposta(
            HttpStatus.CONFLICT,
            "Já existe um cadastro com os dados informados. Entre ou recupere seu acesso.",
            Map.of(),
            "ACCOUNT_CONFLICT");
      cause = cause.getCause();
    }
    return resposta(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Não foi possível concluir agora. Tente novamente.",
        Map.of(),
        "PERSISTENCE_ERROR");
  }

  @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
  public ResponseEntity<ErroApiDto> tratarStatus(
      org.springframework.web.server.ResponseStatusException e) {
    return resposta(
        HttpStatus.valueOf(e.getStatusCode().value()),
        e.getReason(),
        Map.of(),
        e.getStatusCode().value() == 413 ? "IMAGE_TOO_LARGE" : "IMAGE_INVALID");
  }

  @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
  public ResponseEntity<ErroApiDto> tratarUpload(
      org.springframework.web.multipart.MaxUploadSizeExceededException e) {
    return resposta(
        HttpStatus.PAYLOAD_TOO_LARGE, "A imagem deve ter até 5 MB.", Map.of(), "IMAGE_TOO_LARGE");
  }

  @ExceptionHandler({
    org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
    org.springframework.web.bind.MissingRequestHeaderException.class
  })
  public ResponseEntity<ErroApiDto> tratarParametro(Exception e) {
    return resposta(
        HttpStatus.BAD_REQUEST,
        "Revise os parâmetros da solicitação.",
        Map.of(),
        "REQUEST_INVALID");
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErroApiDto> tratarErroInterno(Exception exception) {
    LOGGER.error(
        "Erro interno: traceId={}, tipo={}",
        com.arenageo.config.TraceFilter.current(),
        exception.getClass().getSimpleName());
    return resposta(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Ocorreu um erro interno. Tente novamente mais tarde.",
        Map.of());
  }

  private ResponseEntity<ErroApiDto> resposta(
      HttpStatus status, String mensagem, Map<String, String> campos) {
    return resposta(
        status,
        mensagem,
        campos,
        switch (status) {
          case BAD_REQUEST -> "VALIDATION_ERROR";
          case UNAUTHORIZED -> "SESSION_EXPIRED";
          case NOT_FOUND -> "NOT_FOUND";
          default -> "INTERNAL_ERROR";
        });
  }

  private ResponseEntity<ErroApiDto> resposta(
      HttpStatus status, String mensagem, Map<String, String> campos, String code) {
    ErroApiDto erro =
        new ErroApiDto(
            OffsetDateTime.now(ZoneOffset.UTC),
            status.value(),
            status.getReasonPhrase(),
            mensagem,
            campos,
            code,
            com.arenageo.config.TraceFilter.current());
    return ResponseEntity.status(status).body(erro);
  }
}
