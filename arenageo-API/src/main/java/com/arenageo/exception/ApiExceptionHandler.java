package com.arenageo.exception;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;

import com.arenageo.dto.erro.ErroApiDto;
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
        return resposta(HttpStatus.CONFLICT, exception.getMessage(), Map.of());
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroApiDto> tratarNaoEncontrado(RecursoNaoEncontradoException exception) {
        return resposta(HttpStatus.NOT_FOUND, exception.getMessage(), Map.of());
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroApiDto> tratarRegraNegocio(RegraNegocioException exception) {
        return resposta(HttpStatus.BAD_REQUEST, exception.getMessage(), Map.of());
    }

    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ErroApiDto> tratarCredenciais(CredenciaisInvalidasException exception) {
        return resposta(HttpStatus.UNAUTHORIZED, exception.getMessage(), Map.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroApiDto> tratarIntegridade(DataIntegrityViolationException exception) {
        return resposta(HttpStatus.CONFLICT,
            "Não foi possível concluir o cadastro porque algum dado já existe ou viola uma regra do banco.",
            Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroApiDto> tratarErroInterno(Exception exception) {
        LOGGER.error("Erro não tratado na API do ArenaGeo", exception);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR,
            "Ocorreu um erro interno. Tente novamente mais tarde.", Map.of());
    }

    private ResponseEntity<ErroApiDto> resposta(
            HttpStatus status, String mensagem, Map<String, String> campos) {
        ErroApiDto erro = new ErroApiDto(
            OffsetDateTime.now(ZoneOffset.UTC), status.value(), status.getReasonPhrase(), mensagem, campos);
        return ResponseEntity.status(status).body(erro);
    }
}
