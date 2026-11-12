package com.arenageo.service;

import com.arenageo.exception.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import java.util.function.Supplier;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
public class IdempotenciaService {
  private final com.arenageo.repository.UsuarioRepository usuarios;
  private final com.arenageo.config.JwtTokenService jwt;
  private final JdbcTemplate db;
  private final ObjectMapper json;
  private final byte[] key;

  public IdempotenciaService(
      JdbcTemplate db,
      ObjectMapper json,
      @Value("${security.jwt.secret-base64}") String secret,
      com.arenageo.repository.UsuarioRepository usuarios,
      com.arenageo.config.JwtTokenService jwt) {
    this.usuarios = usuarios;
    this.jwt = jwt;
    this.db = db;
    this.json = json;
    try {
      var h = MessageDigest.getInstance("SHA-256");
      h.update("arenageo-idempotency-v1".getBytes(StandardCharsets.UTF_8));
      key = h.digest(Base64.getDecoder().decode(secret));
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }

  @Transactional
  public Object executar(String token, String scope, Object payload, Supplier<?> action) {
    if (token == null) return action.get();
    if (!token.matches("[A-Za-z0-9-]{16,80}"))
      throw new RegraNegocioException(
          "IDEMPOTENCY_INVALID", null, "Identificador de envio inválido.");
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(key, "HmacSHA256"));
      String hash = HexFormat.of().formatHex(mac.doFinal(json.writeValueAsBytes(payload)));
      db.execute(
          (org.springframework.jdbc.core.ConnectionCallback<Void>)
              c -> {
                try (var p =
                    c.prepareStatement("select pg_advisory_xact_lock(hashtext(?),hashtext(?))")) {
                  p.setString(1, scope);
                  p.setString(2, token);
                  p.execute();
                }
                return null;
              });
      db.update(
          "delete from tb_idempotencia where nm_escopo=? and nm_chave=? and"
              + " dt_expira<current_timestamp",
          scope,
          token);
      var rows =
          db.queryForList(
              "select nm_hash,ds_resposta from tb_idempotencia where nm_escopo=? and nm_chave=?",
              scope,
              token);
      if (!rows.isEmpty()) {
        if (!hash.equals(rows.getFirst().get("nm_hash")))
          throw new CadastroDuplicadoException(
              "IDEMPOTENCY_CONFLICT",
              null,
              "Este envio já foi usado com outros dados. Inicie um novo envio.");
        Object saved =
            json.readValue(decrypt((String) rows.getFirst().get("ds_resposta")), Object.class);
        if (saved instanceof java.util.Map<?, ?> map
            && map.get("user") instanceof java.util.Map<?, ?> user
            && map.get("token") instanceof String) {
          int userId = ((Number) user.get("id")).intValue();
          var account =
              usuarios
                  .findById(userId)
                  .filter(
                      u ->
                          Boolean.TRUE.equals(u.getFlAtivo())
                              && Boolean.TRUE.equals(u.getTipoConta().getFlAtivo()))
                  .orElseThrow(CredenciaisInvalidasException::new);
          var refreshed = new java.util.LinkedHashMap<String, Object>();
          map.forEach((k, v) -> refreshed.put(String.valueOf(k), v));
          refreshed.put("token", jwt.gerarToken(account, false));
          return refreshed;
        }
        return saved;
      }
      Object response = action.get();
      db.update(
          "insert into tb_idempotencia(nm_escopo,nm_chave,nm_hash,ds_resposta,dt_expira) values"
              + " (?,?,?,?,current_timestamp+interval '24 hours')",
          scope,
          token,
          hash,
          encrypt(json.writeValueAsBytes(response)));
      return response;
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException("Falha de proteção de idempotência", e);
    }
  }

  private String encrypt(byte[] plain) throws GeneralSecurityException {
    byte[] iv = new byte[12];
    new SecureRandom().nextBytes(iv);
    Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
    c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
    byte[] enc = c.doFinal(plain);
    byte[] out = Arrays.copyOf(iv, iv.length + enc.length);
    System.arraycopy(enc, 0, out, iv.length, enc.length);
    return Base64.getEncoder().encodeToString(out);
  }

  private byte[] decrypt(String value) throws GeneralSecurityException {
    byte[] all = Base64.getDecoder().decode(value);
    Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
    c.init(
        Cipher.DECRYPT_MODE,
        new SecretKeySpec(key, "AES"),
        new GCMParameterSpec(128, Arrays.copyOf(all, 12)));
    return c.doFinal(Arrays.copyOfRange(all, 12, all.length));
  }
}
