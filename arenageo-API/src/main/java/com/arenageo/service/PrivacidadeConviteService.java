package com.arenageo.service;

import com.arenageo.exception.RegraNegocioException;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrivacidadeConviteService {
  private final JdbcTemplate db;

  public PrivacidadeConviteService(JdbcTemplate db) {
    this.db = db;
  }

  private void lock(int user) {
    db.queryForList("select pg_advisory_xact_lock(84212,?)", user);
  }

  @Transactional(readOnly = true)
  public Object read(int user) {
    boolean enabled =
        db.queryForObject(
            "select coalesce((select fl_receber from tb_convite_preferencia where"
                + " id_usuario=?),true)",
            Boolean.class,
            user);
    var blocked =
        db.queryForList(
            "select b.id_bloqueado as id,p.nm_nome_usuario as username from tb_convite_bloqueio b"
                + " join tb_pessoa p on p.id_usuario=b.id_bloqueado where b.id_usuario=? order by"
                + " lower(p.nm_nome_usuario),b.id_bloqueado",
            user);
    return Map.of("enabled", enabled, "blocked", blocked);
  }

  @Transactional
  public void setEnabled(int user, boolean enabled) {
    lock(user);
    db.update(
        "insert into tb_convite_preferencia(id_usuario,fl_receber) values (?,?) on"
            + " conflict(id_usuario) do update set fl_receber=excluded.fl_receber",
        user,
        enabled);
  }

  @Transactional
  public void block(int user, String username) {
    lock(user);
    var targets =
        db.queryForList(
            "select id_usuario from tb_pessoa where lower(nm_nome_usuario)=lower(?)",
            Integer.class,
            username.trim());
    if (targets.size() != 1 || targets.getFirst() == user)
      throw new RegraNegocioException(
          "BLOCK_INVALID", "username", "Informe o nome de usuário de outra pessoa cadastrada.");
    int target = targets.getFirst();
    if (Boolean.TRUE.equals(
        db.queryForObject(
            "select exists(select 1 from tb_convite_bloqueio where id_usuario=? and"
                + " id_bloqueado=?)",
            Boolean.class,
            user,
            target))) return;
    if (db.queryForObject(
            "select count(*) from tb_convite_bloqueio where id_usuario=?", Integer.class, user)
        >= 500)
      throw new RegraNegocioException("BLOCK_LIMIT", null, "Limite de 500 bloqueios atingido.");
    db.update(
        "insert into tb_convite_bloqueio(id_usuario,id_bloqueado) values (?,?)", user, target);
  }

  @Transactional
  public void unblock(int user, int target) {
    lock(user);
    db.update(
        "delete from tb_convite_bloqueio where id_usuario=? and id_bloqueado=?", user, target);
  }

  // Serialize receiving preferences with invitation creation. Called inside its transaction.
  public void allow(int recipient, int sender) {
    lock(recipient);
    boolean allowed =
        db.queryForObject(
            "select coalesce((select fl_receber from tb_convite_preferencia where"
                + " id_usuario=?),true) and not exists(select 1 from tb_convite_bloqueio where"
                + " id_usuario=? and id_bloqueado=?)",
            Boolean.class,
            recipient,
            recipient,
            sender);
    if (!allowed)
      throw new RegraNegocioException(
          "INVITEE_UNAVAILABLE", null, "Não é possível enviar convite para este jogador.");
  }
}
