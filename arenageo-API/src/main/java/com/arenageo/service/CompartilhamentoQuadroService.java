package com.arenageo.service;

import com.arenageo.exception.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@Service
public class CompartilhamentoQuadroService {
  private final JdbcTemplate db;
  private final ObjectMapper json;
  private static final SecureRandom RANDOM = new SecureRandom();

  public CompartilhamentoQuadroService(JdbcTemplate db, ObjectMapper json) {
    this.db = db;
    this.json = json;
  }

  private Map<String, Object> owned(int user, UUID id) {
    var rows =
        db.queryForList(
            "select * from tb_quadro_tatico where id_quadro=? and id_usuario=? for update",
            id,
            user);
    if (rows.isEmpty())
      throw new RecursoNaoEncontradoException("Quadro não encontrado nesta conta.");
    return rows.getFirst();
  }

  private String hash(String token) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  @Transactional
  public Object status(int user, UUID id) {
    owned(user, id);
    var rows =
        db.queryForList(
            "select dt_expira as expires, nr_revisao as revision, fl_nomes as names from"
                + " tb_quadro_compartilhamento where id_quadro=? and dt_expira>current_timestamp",
            id);
    return rows.isEmpty()
        ? Map.of("active", false)
        : Map.of("active", true, "share", rows.getFirst());
  }

  @Transactional
  public Object create(int user, UUID id, int revision, boolean names) {
    var board = owned(user, id);
    if (Boolean.TRUE.equals(board.get("fl_arquivado"))
        || ((Number) board.get("nr_revisao")).intValue() != revision)
      throw new CadastroDuplicadoException(
          "BOARD_VERSION_CONFLICT",
          null,
          "O quadro mudou ou foi arquivado. Abra a versão da conta antes de compartilhar.");
    var document = json.readTree(board.get("ds_documento").toString());
    if (!names) for (var player : document.get("jogadores")) ((ObjectNode) player).put("nome", "");
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    var expires =
        db.queryForObject(
            "insert into"
                + " tb_quadro_compartilhamento(id_quadro,nm_token_hash,nm_titulo,ds_documento,nr_revisao,fl_nomes,dt_expira)"
                + " values (?,?,?,?::jsonb,?,?,current_timestamp+interval '7 days') on"
                + " conflict(id_quadro) do update set"
                + " nm_token_hash=excluded.nm_token_hash,nm_titulo=excluded.nm_titulo,ds_documento=excluded.ds_documento,nr_revisao=excluded.nr_revisao,fl_nomes=excluded.fl_nomes,dt_expira=excluded.dt_expira"
                + " returning dt_expira",
            java.sql.Timestamp.class,
            id,
            hash(token),
            board.get("nm_titulo"),
            json.writeValueAsString(document),
            revision,
            names);
    return Map.of("token", token, "expires", expires.toInstant().toString(), "revision", revision);
  }

  @Transactional
  public void revoke(int user, UUID id) {
    owned(user, id);
    db.update("delete from tb_quadro_compartilhamento where id_quadro=?", id);
  }

  @Transactional(readOnly = true)
  public Object read(String token) {
    if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) throw unavailable();
    var rows =
        db.queryForList(
            "select s.nm_titulo as title,s.ds_documento::text as document,s.nr_revisao as"
                + " revision,s.dt_expira as expires from tb_quadro_compartilhamento s join"
                + " tb_quadro_tatico q using(id_quadro) join tb_usuario u on"
                + " u.id_usuario=q.id_usuario where s.nm_token_hash=? and"
                + " s.dt_expira>current_timestamp and not q.fl_arquivado and u.fl_ativo",
            hash(token));
    if (rows.isEmpty()) throw unavailable();
    var row = rows.getFirst();
    row.put("document", json.readTree((String) row.get("document")));
    return row;
  }

  private RecursoNaoEncontradoException unavailable() {
    return new RecursoNaoEncontradoException("Este compartilhamento não está disponível.");
  }
}
