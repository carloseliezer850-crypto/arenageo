package com.arenageo.service;

import com.arenageo.exception.*;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocalPartidaService {
  private final JdbcTemplate db;
  private final NotificacaoService avisos;

  public LocalPartidaService(JdbcTemplate db, NotificacaoService avisos) {
    this.db = db;
    this.avisos = avisos;
  }

  private Map<String, Object> match(long id, int user, boolean lock) {
    var rows =
        db.queryForList(
            "select * from tb_partida where id_partida=? and id_organizador=?"
                + (lock ? " for update" : ""),
            id,
            user);
    if (rows.isEmpty())
      throw new RecursoNaoEncontradoException("Partida não encontrada nesta conta.");
    return rows.getFirst();
  }

  private static void conflict(String message) {
    throw new CadastroDuplicadoException("MATCH_BOOKING_CONFLICT", null, message);
  }

  private static final String COMPATIBLE =
      """
      r.id_usuario=m.id_organizador and r.nm_tipo='RESERVA' and r.nm_status='CONFIRMADA'
      and r.dt_inicio<=m.dt_inicio and r.dt_fim>=m.dt_fim and m.dt_inicio>current_timestamp
      and s.fl_ativo and a.fl_ativo and a.nm_status_publicacao='PUBLICADO'
      and exists(select 1 from tb_empresa e where e.id_empresa=a.id_empresa and e.fl_ativo)
      and exists(select 1 from tb_espaco_esporte x where x.id_espaco=s.id_espaco and x.id_esporte=m.id_esporte)
      and exists(select 1 from tb_endereco e where e.id_arena=a.id_arena and e.fl_principal
        and e.nm_uf=m.nm_uf and translate(lower(e.nm_cidade),'áàâãéêíóôõúüç','aaaaeeiooouuc')=translate(lower(m.nm_cidade),'áàâãéêíóôõúüç','aaaaeeiooouuc'))
      and not exists(select 1 from tb_partida other where other.id_reserva=r.id_reserva and other.id_partida<>m.id_partida)
      """;

  @Transactional(readOnly = true)
  public List<Map<String, Object>> options(long id, int user) {
    match(id, user, false);
    return db.queryForList(
        "select r.id_reserva as id,s.nm_nome as space,a.nm_nome as arena from tb_reserva r join"
            + " tb_espaco s using(id_espaco) join tb_arena a using(id_arena) cross join tb_partida"
            + " m where m.id_partida=? and "
            + COMPATIBLE
            + " order by r.id_reserva limit 100",
        id);
  }

  // Only the organizer receives the reservation ID. Never expose customer or financial data.
  public Map<String, Object> view(long id, boolean owner) {
    var rows =
        db.queryForList(
            "select s.id_espaco as \"spaceId\",s.nm_nome as space,a.id_arena as"
                + " \"arenaId\",a.nm_nome as arena,r.nm_status as status,r.id_reserva as"
                + " \"bookingId\" from tb_partida m join tb_reserva r using(id_reserva) join"
                + " tb_espaco s using(id_espaco) join tb_arena a using(id_arena) where"
                + " m.id_partida=?",
            id);
    if (rows.isEmpty()) return null;
    var row = rows.getFirst();
    if (!owner) row.remove("bookingId");
    return row;
  }

  @Transactional
  public void link(long id, int user, Long booking, int version) {
    match(id, user, false);
    if (booking != null) {
      var arenas =
          db.queryForList(
              "select s.id_arena from tb_reserva r join tb_espaco s using(id_espaco) where"
                  + " r.id_reserva=? and r.id_usuario=?",
              Integer.class,
              booking,
              user);
      if (arenas.isEmpty())
        throw new RecursoNaoEncontradoException("Reserva não encontrada nesta conta.");
      // Same lock order as booking operations: arena -> reservation -> match.
      db.queryForList(
          "select id_arena from tb_arena where id_arena=? for update", arenas.getFirst());
      db.queryForList("select id_reserva from tb_reserva where id_reserva=? for update", booking);
    }
    var m = match(id, user, true);
    if (((Number) m.get("nr_versao")).intValue() != version)
      conflict("A partida mudou. Atualize antes de vincular o local.");
    if (!List.of("RASCUNHO", "PUBLICADA").contains(m.get("nm_status"))
        || !((java.sql.Timestamp) m.get("dt_inicio")).toInstant().isAfter(Instant.now()))
      conflict("O local só pode mudar antes do início de uma partida aberta.");
    Long previous = m.get("id_reserva") == null ? null : ((Number) m.get("id_reserva")).longValue();
    if (Objects.equals(previous, booking)) return;
    if (booking != null
        && !Boolean.TRUE.equals(
            db.queryForObject(
                "select exists(select 1 from tb_reserva r join tb_espaco s using(id_espaco) join"
                    + " tb_arena a using(id_arena) cross join tb_partida m where m.id_partida=? and"
                    + " r.id_reserva=? and "
                    + COMPATIBLE
                    + ")",
                Boolean.class,
                id,
                booking)))
      conflict(
          "A reserva deve ser sua, confirmada, livre de outro vínculo, no mesmo município e"
              + " esporte, e cobrir todo o horário da partida.");
    db.update(
        "update tb_partida set id_reserva=?,nr_versao=nr_versao+1 where id_partida=?", booking, id);
    notifyMatch(
        id,
        "local:" + (version + 1),
        booking == null ? "Local da partida a confirmar" : "Reserva vinculada à partida");
  }

  private void notifyMatch(long id, String event, String title) {
    var recipients =
        db.queryForList(
            "select id_organizador from tb_partida where id_partida=? union select id_usuario from"
                + " tb_partida_participante where id_partida=? and nm_status<>'CANCELADA'",
            Integer.class,
            id,
            id);
    for (int user : recipients)
      avisos.emitir(
          user,
          "partida:" + id + ":" + event,
          title,
          "Confira o local e combine os detalhes com o organizador. A situação da partida é"
              + " independente da reserva.",
          "/partidas/" + id);
  }

  // Called in the reservation transaction, after the reservation lock/update.
  public void bookingCancelled(long booking, int version) {
    for (var m :
        db.queryForList(
            "select id_partida from tb_partida where id_reserva=? and nm_status in"
                + " ('RASCUNHO','PUBLICADA') for update",
            booking)) {
      long id = ((Number) m.get("id_partida")).longValue();
      db.update("update tb_partida set nr_versao=nr_versao+1 where id_partida=?", id);
      notifyMatch(
          id,
          "reserva:" + booking + ":cancelada:" + version,
          "Reserva cancelada: local da partida a confirmar");
    }
  }
}
