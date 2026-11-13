package com.arenageo.service;

import com.arenageo.exception.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.*;

@Service
public class QuadroService {
  private final JdbcTemplate db;
  private final ObjectMapper json;

  public QuadroService(JdbcTemplate db, ObjectMapper json) {
    this.db = db;
    this.json = json;
  }

  private static void invalid() {
    throw new RegraNegocioException(
        "BOARD_INVALID",
        "document",
        "Quadro inválido. Confira modalidade, formação, peças e desenhos.");
  }

  private static void keys(JsonNode n, String... fields) {
    if (n == null || !n.isObject() || n.size() != fields.length) invalid();
    for (var f : fields) if (!n.has(f)) invalid();
  }

  private static void point(JsonNode n) {
    if (n == null || !n.isObject()) invalid();
    for (var k : List.of("x", "y")) {
      var v = n.get(k);
      if (v == null
          || !v.isNumber()
          || !Double.isFinite(v.asDouble())
          || v.asDouble() < 0
          || v.asDouble() > 1) invalid();
    }
  }

  private static String text(JsonNode n, int max) {
    if (n == null || !n.isString() || n.asString().length() > max) invalid();
    return n.asString();
  }

  public void validate(JsonNode n) {
    if (n == null || json.writeValueAsBytes(n).length > 1048576) invalid();
    keys(
        n,
        "versao",
        "modalidade",
        "perfil",
        "formacoes",
        "jogadores",
        "bola",
        "marcacoes",
        "adversario");
    if (!n.get("versao").isIntegralNumber()
        || !n.get("versao").toString().equals("1")
        || !n.get("adversario").isBoolean()) invalid();
    String sport = text(n.get("modalidade"), 20), profile = text(n.get("perfil"), 20);
    if (!Set.of("futsal", "society", "futebol").contains(sport)
        || !Set.of("pequena", "media", "grande", "treino").contains(profile)) invalid();
    int count =
        switch (sport) {
          case "futsal" -> profile.equals("treino") ? 3 : 5;
          case "society" -> profile.equals("treino") ? 5 : 7;
          default -> profile.equals("treino") ? 7 : 11;
        };
    var formations = n.get("formacoes");
    if (!formations.isArray() || formations.size() != 2) invalid();
    for (var f : formations) {
      var value = text(f, 30);
      if (!value.matches("[0-9]+(-[0-9]+){0,5}")) invalid();
      int sum = 0;
      for (var part : value.split("-")) {
        if (part.length() > 2) invalid();
        sum += Integer.parseInt(part);
      }
      if (sum != count - 1) invalid();
    }
    var players = n.get("jogadores");
    if (!players.isArray() || players.size() != count * 2) invalid();
    Set<String> ids = new HashSet<>();
    for (var p : players) {
      keys(p, "id", "lado", "numero", "nome", "x", "y");
      var id = text(p.get("id"), 20);
      if (!ids.add(id) || !Set.of("0", "1").contains(p.get("lado").toString())) invalid();
      int side = p.get("lado").asInt();
      if (side < 0 || side > 1 || !id.matches(side + "-[0-9]{1,2}")) invalid();
      int i = Integer.parseInt(id.substring(2));
      if (i >= count || !id.equals(side + "-" + i)) invalid();
      text(p.get("numero"), 3);
      text(p.get("nome"), 22);
      point(p);
    }
    keys(n.get("bola"), "x", "y");
    point(n.get("bola"));
    var marks = n.get("marcacoes");
    if (!marks.isArray() || marks.size() > 200) invalid();
    ids.clear();
    for (var m : marks) {
      keys(m, "id", "tipo", "inicio", "fim");
      if (!ids.add(text(m.get("id"), 80))
          || !Set.of("seta", "passe", "zona").contains(text(m.get("tipo"), 10))) invalid();
      keys(m.get("inicio"), "x", "y");
      keys(m.get("fim"), "x", "y");
      point(m.get("inicio"));
      point(m.get("fim"));
    }
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> list(int user, String query, boolean archived) {
    if (query.length() > 120) invalid();
    return db.queryForList(
        "select id_quadro as id,nm_titulo as title,ds_documento->>'modalidade' as sport,nr_revisao"
            + " as revision,fl_arquivado as archived,dt_atualizado as updated from tb_quadro_tatico"
            + " where id_usuario=? and fl_arquivado=? and position(lower(?) in lower(nm_titulo))>0"
            + " order by dt_atualizado desc,id_quadro limit 100",
        user,
        archived,
        query.trim());
  }

  @Transactional(readOnly = true)
  public Map<String, Object> read(int user, UUID id) {
    var rows =
        db.queryForList(
            "select id_quadro as id,nm_titulo as title,ds_documento::text as document,nr_revisao as"
                + " revision,fl_arquivado as archived,dt_atualizado as updated from"
                + " tb_quadro_tatico where id_quadro=? and id_usuario=?",
            id,
            user);
    if (rows.isEmpty())
      throw new RecursoNaoEncontradoException("Quadro não encontrado nesta conta.");
    var row = rows.getFirst();
    row.put("document", json.readTree((String) row.get("document")));
    return row;
  }

  @Transactional
  public Map<String, Object> save(
      int user, UUID id, String title, JsonNode document, int revision, boolean create) {
    validate(document);
    if (title == null || title.isBlank() || title.length() > 120)
      throw new RegraNegocioException(
          "BOARD_INVALID", "title", "Informe um título de até 120 caracteres.");
    if (create) {
      db.queryForList("select id_usuario from tb_usuario where id_usuario=? for update", user);
      if (db.queryForObject(
              "select count(*) from tb_quadro_tatico where id_usuario=?", Integer.class, user)
          >= 100)
        throw new RegraNegocioException(
            "BOARD_LIMIT",
            null,
            "Limite de 100 quadros atingido. Exclua um quadro antes de criar outro.");
      db.update(
          "insert into tb_quadro_tatico(id_quadro,id_usuario,nm_titulo,ds_documento) values"
              + " (?,?,?,?::jsonb)",
          id,
          user,
          title.trim(),
          json.writeValueAsString(document));
    } else {
      read(user, id);
      if (db.update(
              "update tb_quadro_tatico set"
                  + " nm_titulo=?,ds_documento=?::jsonb,nr_revisao=nr_revisao+1,dt_atualizado=current_timestamp"
                  + " where id_quadro=? and id_usuario=? and nr_revisao=? and not fl_arquivado",
              title.trim(),
              json.writeValueAsString(document),
              id,
              user,
              revision)
          != 1)
        throw new CadastroDuplicadoException(
            "BOARD_VERSION_CONFLICT",
            null,
            "O quadro mudou em outra aba ou foi arquivado. Suas alterações continuam aqui: salve"
                + " uma cópia ou abra a versão da conta.");
    }
    return read(user, id);
  }

  @Transactional
  public void archive(int user, UUID id, int revision, boolean archived) {
    read(user, id);
    if (db.update(
            "update tb_quadro_tatico set"
                + " fl_arquivado=?,nr_revisao=nr_revisao+1,dt_atualizado=current_timestamp where"
                + " id_quadro=? and id_usuario=? and nr_revisao=?",
            archived,
            id,
            user,
            revision)
        != 1)
      throw new CadastroDuplicadoException(
          "BOARD_VERSION_CONFLICT", null, "O quadro mudou. Atualize a biblioteca.");
  }

  @Transactional
  public void delete(int user, UUID id, int revision) {
    read(user, id);
    if (db.update(
            "delete from tb_quadro_tatico where id_quadro=? and id_usuario=? and nr_revisao=?",
            id,
            user,
            revision)
        != 1)
      throw new CadastroDuplicadoException(
          "BOARD_VERSION_CONFLICT", null, "O quadro mudou. Atualize a biblioteca.");
  }
}
