package com.arenageo.util;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class DocumentoUtilsTest {
  @Test
  void deveValidarCpfComMascara() {
    assertTrue(DocumentoUtils.cpfValido("529.982.247-25"));
  }

  @Test
  void deveRejeitarCpfComDigitosInvalidos() {
    assertFalse(DocumentoUtils.cpfValido("111.111.111-11"));
    assertFalse(DocumentoUtils.cpfValido("529.982.247-24"));
  }

  @Test
  void deveValidarCnpjComMascara() {
    assertTrue(DocumentoUtils.cnpjValido("11.222.333/0001-81"));
  }

  @Test
  void deveRejeitarCnpjComDigitosInvalidos() {
    assertFalse(DocumentoUtils.cnpjValido("11.222.333/0001-80"));
    assertFalse(DocumentoUtils.cnpjValido("00.000.000/0000-00"));
  }

  @Test
  void aceitaExemploOficialAlfanumericoPreservandoLetras() {
    assertTrue(DocumentoUtils.cnpjValido("12.ABC.345/01DE-35"));
    assertTrue(DocumentoUtils.cnpjValido("12abc34501de35"));
    assertFalse(DocumentoUtils.cnpjValido("12ABC34501DE36"));
    assertFalse(DocumentoUtils.cpfValido("abc52998224725"));
  }

  @Test
  void politicaSenhaRespeitaUnicodeELimiteDeBytes() {
    org.junit.jupiter.api.Assertions.assertDoesNotThrow(
        () ->
            ValidacaoCadastro.senha(
                "uma frase com espaços", "email@example.test", "user", "password"));
    org.junit.jupiter.api.Assertions.assertThrows(
        com.arenageo.exception.RegraNegocioException.class,
        () -> ValidacaoCadastro.senha("á".repeat(37), "email@example.test", "user", "password"));
    org.junit.jupiter.api.Assertions.assertThrows(
        com.arenageo.exception.RegraNegocioException.class,
        () -> ValidacaoCadastro.senha("123456789012", "email@example.test", "user", "password"));
  }
}
