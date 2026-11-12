package com.arenageo.util;

import com.arenageo.exception.RegraNegocioException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

public final class ValidacaoCadastro {
  private ValidacaoCadastro() {}

  private static final Set<String> COMUNS =
      Set.of(
          "123456789012",
          "1234567890123",
          "password1234",
          "senha12345678",
          "qwerty1234567",
          "abcdefghijkl");

  public static void senha(String value, String email, String username, String field) {
    String message = null;
    if (value == null || value.codePointCount(0, value.length()) < 12)
      message = "Use pelo menos 12 caracteres.";
    else if (value.getBytes(StandardCharsets.UTF_8).length > 72)
      message = "Esta senha ultrapassa o limite de 72 bytes UTF-8.";
    else if (COMUNS.contains(value.toLowerCase(java.util.Locale.ROOT))
        || value.equalsIgnoreCase(email)
        || value.equalsIgnoreCase(username)
        || value.chars().distinct().count() == 1) message = "Escolha uma senha menos comum.";
    if (message != null) throw new RegraNegocioException("PASSWORD_POLICY", field, message);
  }

  public static String telefone(String value, boolean required, String field) {
    if (value == null || value.isBlank()) {
      if (required)
        throw new RegraNegocioException(
            "PHONE_INVALID", field, "Informe um telefone válido com DDD.");
      return null;
    }
    String digits = DocumentoUtils.somenteDigitos(value);
    if (digits.startsWith("55") && digits.length() >= 12) digits = digits.substring(2);
    if (!value.matches("[+0-9() .-]+")
        || !digits.matches("[1-9][0-9](?:[2-5][0-9]{7}|9[0-9]{8})")
        || !Set.of(
                "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "24", "27", "28",
                "31", "32", "33", "34", "35", "37", "38", "41", "42", "43", "44", "45", "46", "47",
                "48", "49", "51", "53", "54", "55", "61", "62", "63", "64", "65", "66", "67", "68",
                "69", "71", "73", "74", "75", "77", "79", "81", "82", "83", "84", "85", "86", "87",
                "88", "89", "91", "92", "93", "94", "95", "96", "97", "98", "99")
            .contains(digits.substring(0, 2)))
      throw new RegraNegocioException(
          "PHONE_INVALID", field, "Informe um telefone válido com DDD.");
    return "+55" + digits;
  }

  public static void website(String value, String field) {
    if (value == null || value.isBlank()) return;
    try {
      var uri = java.net.URI.create(value);
      if (!("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
          || uri.getHost() == null
          || uri.getUserInfo() != null) throw new IllegalArgumentException();
    } catch (IllegalArgumentException ex) {
      throw new RegraNegocioException(
          "URL_INVALID", field, "Informe um endereço http ou https válido.");
    }
  }
}
