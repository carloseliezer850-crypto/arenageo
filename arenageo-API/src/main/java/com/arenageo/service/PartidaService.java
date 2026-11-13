package com.arenageo.service;

import com.arenageo.dto.partida.PartidaRequest;
import com.arenageo.exception.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartidaService {
  private final JdbcTemplate db;

  public PartidaService(JdbcTemplate db) {
    this.db = db;
  }

  private static final String SELECT =
      """
      select m.*,p.nm_nome_usuario as organizer,
      (select count(*) from tb_partida_participante v where v.id_partida=m.id_partida and v.nm_status='CONFIRMADA') as confirmed
      from tb_partida m join tb_pessoa p on p.id_usuario=m.id_organizador
      """;

  private Map<String, Object> view(java.sql.ResultSet r, int n) throws java.sql.SQLException {
    var v = new LinkedHashMap<String, Object>();
    v.put("id", r.getLong("id_partida"));
    v.put("creatorId", r.getInt("id_organizador"));
    v.put("organizer", r.getString("organizer"));
    v.put("sportId", r.getInt("id_esporte"));
    v.put("skillLevelId", r.getInt("id_nivel_habilidade"));
    v.put("title", r.getString("nm_titulo"));
    v.put("description", r.getString("ds_descricao"));
    v.put("location", r.getString("nm_local"));
    v.put("city", r.getString("nm_cidade"));
    v.put("state", r.getString("nm_uf"));
    var start = r.getTimestamp("dt_inicio").toInstant();
    var end = r.getTimestamp("dt_fim").toInstant();
    v.put("dateTime", start.toString());
    v.put(
        "accepting", "PUBLICADA".equals(r.getString("nm_status")) && start.isAfter(Instant.now()));
    v.put("canComplete", !end.isAfter(Instant.now()));
    v.put("endTime", end.toString());
    v.put("timezone", r.getString("nm_fuso"));
    v.put("durationMinutes", Duration.between(start, end).toMinutes());
    v.put("maxPlayers", r.getInt("nr_capacidade"));
    v.put("currentPlayers", r.getInt("confirmed"));
    v.put("status", r.getString("nm_status"));
    v.put("statusId", "PUBLICADA".equals(r.getString("nm_status")) ? 1 : 0);
    v.put("version", r.getInt("nr_versao"));
    v.put("visibility", "public");
    v.put("createdAt", r.getTimestamp("dt_criado").toInstant().toString());
    return v;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> buscar(
      String city, String state, Integer sport, Integer level, LocalDate date, int page, int size) {
    if ((sport != null && sport <= 0) || (level != null && level <= 0) || page < 0
        || page > 10000
        || size < 1
        || size > 50
        || city.length() > 120
        || (!state.isEmpty() && !state.matches("[A-Z]{2}")))
      throw new RegraNegocioException("SEARCH_INVALID", null, "Revise os filtros de busca.");
    var args = new ArrayList<Object>();
    String where = " where m.nm_status='PUBLICADA' and m.dt_inicio>current_timestamp";
    if (!city.isBlank()) {
      where +=
          " and translate(lower(m.nm_cidade),'áàâãéêíóôõúüç','aaaaeeiooouuc') ="
              + " translate(lower(?),'áàâãéêíóôõúüç','aaaaeeiooouuc')";
      args.add(city.trim());
    }
    if (!state.isEmpty()) {
      where += " and m.nm_uf=?";
      args.add(state);
    }
    if (sport != null) {
      where += " and m.id_esporte=?";
      args.add(sport);
    }
    if (level != null) {
      where += " and m.id_nivel_habilidade=?";
      args.add(level);
    }
    if (date != null) {
      where += " and (m.dt_inicio at time zone m.nm_fuso)::date=?";
      args.add(date);
    }
    var total =
        db.queryForObject("select count(*) from tb_partida m" + where, Long.class, args.toArray());
    args.add(size);
    args.add(page * size);
    return Map.of(
        "items",
        db.query(
            SELECT + where + " order by m.dt_inicio,m.id_partida limit ? offset ?",
            this::view,
            args.toArray()),
        "total",
        total,
        "page",
        page,
        "size",
        size);
  }

  private Map<String, Object> raw(long id, boolean lock) {
    var rows =
        db.queryForList(
            "select * from tb_partida where id_partida=?" + (lock ? " for update" : ""), id);
    if (rows.isEmpty()) throw new RecursoNaoEncontradoException("Partida não encontrada.");
    return rows.getFirst();
  }

  private boolean owner(Map<String, Object> row, Integer user) {
    return user != null && ((Number) row.get("id_organizador")).intValue() == user;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> detalhe(long id, Integer user) {
    var row = raw(id, false);
    if ("RASCUNHO".equals(row.get("nm_status")) && !owner(row, user))
      throw new RecursoNaoEncontradoException("Partida não encontrada.");
    var v = db.query(SELECT + " where m.id_partida=?", this::view, id).getFirst();
    v.put("canManage", owner(row, user));
    var status =
        user == null
            ? List.<String>of()
            : db.queryForList(
                "select nm_status from tb_partida_participante where id_partida=? and id_usuario=?",
                String.class,
                id,
                user);
    v.put("participation", status.isEmpty() ? "" : status.getFirst());
    v.put(
        "queuePosition",
        user == null
            ? 0
            : db.queryForObject(
                "select count(*) from tb_partida_participante a join tb_partida_participante b on"
                    + " b.id_partida=a.id_partida and b.id_usuario=? and b.nm_status='LISTA_ESPERA'"
                    + " where a.id_partida=? and a.nm_status='LISTA_ESPERA' and"
                    + " (a.dt_entrada,a.id_usuario)<=(b.dt_entrada,b.id_usuario)",
                Integer.class,
                user,
                id));
    return v;
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> minhas(int user) {
    return db.query(
        SELECT
            + " where m.id_organizador=? or exists(select 1 from tb_partida_participante v where"
            + " v.id_partida=m.id_partida and v.id_usuario=? and v.nm_status<>'CANCELADA') order by"
            + " m.dt_inicio desc,m.id_partida desc limit 100",
        this::view,
        user,
        user);
  }

  @Transactional
  public Map<String, Object> criar(int user, PartidaRequest d) {
    ZoneId zone;
    try {
      zone = ZoneId.of(d.timezone());
    } catch (Exception ex) {
      throw new RegraNegocioException("TIMEZONE_INVALID", "timezone", "Selecione um fuso válido.");
    }
    var offsets = zone.getRules().getValidOffsets(d.dateTime());
    if (offsets.size() != 1)
      throw new RegraNegocioException(
          "MATCH_DATE_INVALID",
          "dateTime",
          "Horário inexistente ou ambíguo neste fuso. Escolha outro horário.");
    var start = d.dateTime().atOffset(offsets.getFirst()).toInstant();
    if (!start.isAfter(Instant.now()))
      throw new RegraNegocioException(
          "MATCH_DATE_INVALID", "dateTime", "Escolha uma data e horário futuros.");
    for (var item :
        List.of(
            new Object[] {"tb_esporte", "id_esporte", d.sportId()},
            new Object[] {"tb_nivel_habilidade", "id_nivel_habilidade", d.skillLevelId()}))
      if (!Boolean.TRUE.equals(
          db.queryForObject(
              "select exists(select 1 from " + item[0] + " where " + item[1] + "=? and fl_ativo)",
              Boolean.class,
              item[2])))
        throw new RegraNegocioException(
            "CATALOG_ITEM_UNAVAILABLE",
            item[0].equals("tb_esporte") ? "sportId" : "skillLevelId",
            "Selecione uma opção ativa do catálogo.");
    var end = start.plusSeconds(d.durationMinutes() * 60L);
    Long id =
        db.queryForObject(
            "insert into"
                + " tb_partida(id_organizador,id_esporte,id_nivel_habilidade,nm_titulo,ds_descricao,nm_local,nm_cidade,nm_uf,dt_inicio,dt_fim,nm_fuso,nr_capacidade,nm_status)"
                + " values(?,?,?,?,?,?,?,?,?,?,?,?,?) returning id_partida",
            Long.class,
            user,
            d.sportId(),
            d.skillLevelId(),
            d.title().trim(),
            d.description().trim(),
            d.location().trim(),
            d.city().trim(),
            d.state(),
            java.sql.Timestamp.from(start),
            java.sql.Timestamp.from(end),
            zone.getId(),
            d.maxPlayers(),
            d.publish() ? "PUBLICADA" : "RASCUNHO");
    if (d.participate()) {
      travaUsuario(user);
      if (d.publish()) checarAgenda(user, id);
      db.update(
          "insert into tb_partida_participante(id_partida,id_usuario,nm_status)"
              + " values(?,?,'CONFIRMADA')",
          id,
          user);
    }
    return detalhe(id, user);
  }

  private void travaUsuario(int user) {
    db.execute(
        (org.springframework.jdbc.core.ConnectionCallback<Void>)
            c -> {
              try (var s = c.prepareStatement("select pg_advisory_xact_lock(73419,?)")) {
                s.setInt(1, user);
                s.execute();
              }
              return null;
            });
  }

  private void checarAgenda(int user, long id) {
    if (Boolean.TRUE.equals(
        db.queryForObject(
            "select exists(select 1 from tb_partida a join tb_partida_participante v on"
                + " v.id_partida=a.id_partida join tb_partida b on b.id_partida=? where"
                + " v.id_usuario=? and v.nm_status='CONFIRMADA' and a.nm_status='PUBLICADA' and"
                + " a.id_partida<>b.id_partida and a.dt_inicio<b.dt_fim and b.dt_inicio<a.dt_fim)",
            Boolean.class,
            id,
            user)))
      throw new CadastroDuplicadoException(
          "SCHEDULE_CONFLICT", null, "Você já participa de outra partida nesse horário.");
  }

  @Transactional
  public Map<String, Object> participar(long id, int user, boolean sair) {
    var row = raw(id, true);
    if (!"PUBLICADA".equals(row.get("nm_status"))
        || !((java.sql.Timestamp) row.get("dt_inicio")).toInstant().isAfter(Instant.now()))
      throw new CadastroDuplicadoException(
          "MATCH_CLOSED", null, "Esta partida não aceita alterações de participação.");
    travaUsuario(user);
    var old =
        db.queryForList(
            "select nm_status from tb_partida_participante where id_partida=? and id_usuario=?",
            String.class,
            id,
            user);
    if (sair) {
      db.update(
          "update tb_partida_participante set nm_status='CANCELADA' where id_partida=? and"
              + " id_usuario=?",
          id,
          user);
    } else if (old.isEmpty() || !"CONFIRMADA".equals(old.getFirst())) {
      checarAgenda(user, id);
      int count =
          db.queryForObject(
              "select count(*) from tb_partida_participante where id_partida=? and"
                  + " nm_status='CONFIRMADA'",
              Integer.class,
              id);
      var queue =
          db.queryForList(
              "select id_usuario from tb_partida_participante where id_partida=? and"
                  + " nm_status='LISTA_ESPERA' order by dt_entrada,id_usuario",
              Integer.class,
              id);
      String status =
          count < ((Number) row.get("nr_capacidade")).intValue()
                  && (queue.isEmpty() || queue.getFirst() == user)
              ? "CONFIRMADA"
              : "LISTA_ESPERA";
      if (!old.isEmpty() && "LISTA_ESPERA".equals(old.getFirst()) && status.equals("LISTA_ESPERA"))
        return detalhe(id, user);
      db.update(
          "insert into tb_partida_participante(id_partida,id_usuario,nm_status) values(?,?,?) on"
              + " conflict(id_partida,id_usuario) do update set"
              + " nm_status=excluded.nm_status,dt_entrada=clock_timestamp()",
          id,
          user,
          status);
    }
    return detalhe(id, user);
  }

  @Transactional
  public Map<String, Object> transicao(
      long id, int user, String action, int version, String reason) {
    var row = raw(id, true);
    if (!owner(row, user))
      throw new RecursoNaoEncontradoException("Partida não encontrada nesta conta.");
    if (((Number) row.get("nr_versao")).intValue() != version)
      throw new CadastroDuplicadoException(
          "VERSION_CONFLICT", null, "A partida mudou. Recarregue antes de continuar.");
    String old = (String) row.get("nm_status");
    boolean future = ((java.sql.Timestamp) row.get("dt_inicio")).toInstant().isAfter(Instant.now());
    boolean allowed =
        (action.equals("PUBLICADA") && old.equals("RASCUNHO") && future)
            || (action.equals("CANCELADA") && (old.equals("RASCUNHO") || old.equals("PUBLICADA")))
            || (action.equals("CONCLUIDA")
                && old.equals("PUBLICADA")
                && !((java.sql.Timestamp) row.get("dt_fim")).toInstant().isAfter(Instant.now()));
    if (!allowed)
      throw new RegraNegocioException(
          "MATCH_TRANSITION_INVALID", null, "Esta mudança não está disponível no estado atual.");
    if (action.equals("CANCELADA") && (reason == null || reason.isBlank()))
      throw new RegraNegocioException(
          "CANCELLATION_REASON_REQUIRED", "reason", "Informe o motivo do cancelamento.");
    if (action.equals("PUBLICADA")) {
      for (Integer participant :
          db.queryForList(
              "select id_usuario from tb_partida_participante where id_partida=? and"
                  + " nm_status='CONFIRMADA' order by id_usuario",
              Integer.class,
              id)) {
        travaUsuario(participant);
        checarAgenda(participant, id);
      }
    }
    db.update(
        "update tb_partida set nm_status=?,ds_motivo=?,nr_versao=nr_versao+1 where id_partida=?",
        action,
        reason,
        id);
    return detalhe(id, user);
  }
}
