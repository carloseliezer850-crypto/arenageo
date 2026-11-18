package com.arenageo.service;

import com.arenageo.exception.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConviteService {
  private final JdbcTemplate db;
  private final PartidaService partidas;
  private final NotificacaoService avisos;

  private final PrivacidadeConviteService privacy;

  public ConviteService(
      JdbcTemplate db, PartidaService p, NotificacaoService n, PrivacidadeConviteService privacy) {
    this.privacy = privacy;
    this.db = db;
    partidas = p;
    avisos = n;
  }

  private Map<String, Object> partida(long id) {
    var rows = db.queryForList("select * from tb_partida where id_partida=? for update", id);
    if (rows.isEmpty()) throw new RecursoNaoEncontradoException("Partida não encontrada.");
    return rows.getFirst();
  }

  private void owner(Map<String, Object> m, int user) {
    if (((Number) m.get("id_organizador")).intValue() != user)
      throw new RecursoNaoEncontradoException("Partida não encontrada nesta conta.");
  }

  private void aberta(Map<String, Object> m) {
    if (!"PUBLICADA".equals(m.get("nm_status"))
        || !((java.sql.Timestamp) m.get("dt_inicio")).toInstant().isAfter(java.time.Instant.now()))
      throw new CadastroDuplicadoException(
          "MATCH_CLOSED", null, "Esta partida não recebe convites ou respostas.");
  }

  @Transactional
  public Object convidar(int user, long match, String username) {
    db.queryForList("select pg_advisory_xact_lock(84211,?)", user);
    var m = partida(match);
    owner(m, user);
    aberta(m);
    var users =
        db.queryForList(
            "select p.id_usuario from tb_pessoa p join tb_usuario u using(id_usuario) join"
                + " tb_jogador j using(id_pessoa) where lower(p.nm_nome_usuario)=lower(?) and"
                + " u.fl_ativo and j.fl_ativo",
            Integer.class,
            username.trim());
    if (users.size() != 1 || users.getFirst() == user)
      throw new RegraNegocioException(
          "INVITEE_INVALID", "username", "Informe o nome de usuário de outro jogador cadastrado.");
    int target = users.getFirst();
    var existing =
        db.queryForList(
            "select id_convite as id,nm_status as status from tb_partida_convite where id_partida=?"
                + " and id_destinatario=?",
            match,
            target);
    if (!existing.isEmpty()) return existing.getFirst();
    privacy.allow(target, user);
    if (Boolean.TRUE.equals(
        db.queryForObject(
            "select exists(select 1 from tb_partida_participante where id_partida=? and"
                + " id_usuario=? and nm_status<>'CANCELADA')",
            Boolean.class,
            match,
            target)))
      throw new RegraNegocioException(
          "ALREADY_PARTICIPATING", "username", "Este jogador já participa ou está na fila.");
    if (db.queryForObject(
            "select count(*) from tb_partida_convite c join tb_partida p using(id_partida) where"
                + " p.id_organizador=? and c.dt_criado>current_timestamp-interval '1 hour'",
            Integer.class,
            user)
        >= 20)
      throw new RegraNegocioException(
          "INVITE_LIMIT", null, "Limite de 20 convites por hora atingido. Tente mais tarde.");
    long id =
        db.queryForObject(
            "insert into tb_partida_convite(id_partida,id_destinatario) values (?,?) returning"
                + " id_convite",
            Long.class,
            match,
            target);
    avisos.emitir(
        target,
        "convite:" + id,
        "Convite para partida",
        "Você foi convidado para "
            + m.get("nm_titulo")
            + ". Aceitar respeita a fila e as vagas disponíveis.",
        "/partidas/" + match);
    return Map.of("id", id, "status", "PENDENTE");
  }

  private static final String LIST =
      "select c.id_convite as id,c.id_partida as \"matchId\",p.nm_titulo as title,u.nm_nome_usuario"
          + " as username,case when c.nm_status='PENDENTE' and (p.nm_status<>'PUBLICADA' or"
          + " p.dt_inicio<=current_timestamp) then 'EXPIRADO' else c.nm_status end as"
          + " status,c.dt_criado as created from tb_partida_convite c join tb_partida p"
          + " using(id_partida) join tb_pessoa u on u.id_usuario=c.id_destinatario";

  @Transactional(readOnly = true)
  public Object meus(int user) {
    return db.queryForList(
        LIST + " where c.id_destinatario=? order by c.id_convite desc limit 100", user);
  }

  @Transactional
  public Object enviados(int user, long match) {
    owner(partida(match), user);
    return db.queryForList(
        LIST + " where c.id_partida=? order by c.id_convite desc limit 100", match);
  }

  @Transactional
  public Object responder(int user, long id, String action) {
    var ids =
        db.queryForList(
            "select id_partida from tb_partida_convite where id_convite=?", Long.class, id);
    if (ids.isEmpty()) throw new RecursoNaoEncontradoException("Convite não encontrado.");
    long match = ids.getFirst();
    var m = partida(match);
    var c = db.queryForMap("select * from tb_partida_convite where id_convite=? for update", id);
    int target = ((Number) c.get("id_destinatario")).intValue();
    if (action.equals("REVOGAR")) owner(m, user);
    else if (target != user)
      throw new RecursoNaoEncontradoException("Convite não encontrado nesta conta.");
    String next =
        switch (action) {
          case "ACEITAR" -> "ACEITO";
          case "RECUSAR" -> "RECUSADO";
          case "REVOGAR" -> "REVOGADO";
          default -> throw new RegraNegocioException("ACTION_INVALID", null, "Ação inválida.");
        };
    String old = (String) c.get("nm_status");
    if (old.equals(next)) return Map.of("status", old);
    if (!old.equals("PENDENTE"))
      throw new CadastroDuplicadoException(
          "INVITE_CLOSED", null, "Este convite já foi respondido ou revogado.");
    aberta(m);
    Object participation = null;
    if (action.equals("ACEITAR")) participation = partidas.participar(match, target, false);
    db.update(
        "update tb_partida_convite set nm_status=?,dt_resposta=current_timestamp where"
            + " id_convite=?",
        next,
        id);
    int recipient =
        action.equals("REVOGAR") ? target : ((Number) m.get("id_organizador")).intValue();
    avisos.emitir(
        recipient,
        "convite:" + id + ":" + next,
        "Convite atualizado",
        "O convite para " + m.get("nm_titulo") + " foi " + next.toLowerCase(Locale.ROOT) + ".",
        "/partidas/" + match);
    return participation == null
        ? Map.of("status", next)
        : Map.of("status", next, "participation", participation);
  }
}
