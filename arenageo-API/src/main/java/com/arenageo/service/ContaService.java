package com.arenageo.service;

import com.arenageo.exception.RegraNegocioException;
import com.arenageo.util.ValidacaoCadastro;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContaService {
  public record EmailEvento(String email, String token, String tipo) {}

  private final JdbcTemplate db;
  private final ApplicationEventPublisher events;
  private final PasswordEncoder encoder;

  public ContaService(JdbcTemplate db, ApplicationEventPublisher events, PasswordEncoder encoder) {
    this.db = db;
    this.events = events;
    this.encoder = encoder;
  }

  private String hash(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  @Transactional
  public void emitir(Integer user, String tipo) {
    var rows =
        db.queryForList(
            "select nm_email,fl_email_verificado from tb_usuario where id_usuario=? and fl_ativo"
                + " for update",
            user);
    if (rows.isEmpty()
        || ("VERIFY".equals(tipo)
            && Boolean.TRUE.equals(rows.getFirst().get("fl_email_verificado")))) return;
    if (Boolean.TRUE.equals(
        db.queryForObject(
            "select exists(select 1 from tb_token_conta where id_usuario=? and nm_tipo=? and"
                + " dt_criado>current_timestamp-interval '60 seconds')",
            Boolean.class,
            user,
            tipo))) return;
    db.update(
        "update tb_token_conta set dt_usado=current_timestamp where id_usuario=? and nm_tipo=? and"
            + " dt_usado is null",
        user,
        tipo);
    byte[] bytes = new byte[32];
    new SecureRandom().nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    db.update(
        "insert into tb_token_conta(nm_hash,id_usuario,nm_tipo,dt_expira)"
            + " values(?,?,?,current_timestamp+interval '30 minutes')",
        hash(token),
        user,
        tipo);
    events.publishEvent(new EmailEvento((String) rows.getFirst().get("nm_email"), token, tipo));
  }

  @Transactional
  public void recuperar(String email) {
    var ids =
        db.queryForList(
            "select id_usuario from tb_usuario where lower(nm_email)=lower(?) and fl_ativo",
            Integer.class,
            email.trim());
    if (!ids.isEmpty()) emitir(ids.getFirst(), "RESET");
  }

  @Transactional
  public void consumir(String token, String tipo, String senha) {
    if (token == null || !token.matches("[A-Za-z0-9_-]{43}"))
      throw new RegraNegocioException(
          "TOKEN_INVALID", null, "Este link é inválido ou expirou. Solicite outro.");
    var rows =
        db.queryForList(
            "select id_usuario from tb_token_conta where nm_hash=? and nm_tipo=? and dt_usado is"
                + " null and dt_expira>current_timestamp for update",
            hash(token),
            tipo);
    if (rows.isEmpty())
      throw new RegraNegocioException(
          "TOKEN_INVALID", null, "Este link é inválido ou expirou. Solicite outro.");
    int user = ((Number) rows.getFirst().get("id_usuario")).intValue();
    if ("RESET".equals(tipo)) {
      var account =
          db.queryForMap(
              "select u.nm_email,p.nm_nome_usuario from tb_usuario u join tb_pessoa p"
                  + " using(id_usuario) where u.id_usuario=? for update of u",
              user);
      ValidacaoCadastro.senha(
          senha,
          (String) account.get("nm_email"),
          Objects.toString(account.get("nm_nome_usuario"), ""),
          "password");
      db.update(
          "update tb_usuario set nm_senha_hash=?,nr_sessao=nr_sessao+1 where id_usuario=?",
          encoder.encode(senha),
          user);
      // Cached registration sessions must never restore access after a password reset.
      db.update("delete from tb_idempotencia where nm_escopo in ('Jogador','Empresa')");
    } else db.update("update tb_usuario set fl_email_verificado=true where id_usuario=?", user);
    db.update(
        "update tb_token_conta set dt_usado=current_timestamp where id_usuario=? and nm_tipo=? and"
            + " dt_usado is null",
        user,
        tipo);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> estado(Integer user) {
    return db.queryForMap(
        "select fl_email_verificado as verified from tb_usuario where id_usuario=?", user);
  }
}
