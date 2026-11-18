package com.arenageo.service;

import com.arenageo.exception.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacaoService {
  private final JdbcTemplate db;

  public NotificacaoService(JdbcTemplate db) {
    this.db = db;
  }

  @Transactional
  public void emitir(int user, String key, String title, String message, String target) {
    if (!target.matches("/(partidas|reservas)/[0-9]+"))
      throw new IllegalArgumentException("Destino inválido");
    db.update(
        "insert into tb_notificacao(id_usuario,nm_evento,nm_titulo,ds_mensagem,nm_destino) values"
            + " (?,?,?,?,?) on conflict(id_usuario,nm_evento) do nothing",
        user,
        key,
        title,
        message,
        target);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> listar(int user, int page) {
    if (page < 0 || page > 10000)
      throw new RegraNegocioException("PAGE_INVALID", "page", "Página inválida.");
    return Map.of(
        "items",
        db.queryForList(
            "select id_notificacao as id,nm_titulo as title,ds_mensagem as message,nm_destino as"
                + " target,fl_lida as read,dt_criado as created from tb_notificacao where"
                + " id_usuario=? order by id_notificacao desc limit 20 offset ?",
            user,
            page * 20),
        "unread",
        db.queryForObject(
            "select count(*) from tb_notificacao where id_usuario=? and not fl_lida",
            Long.class,
            user));
  }

  @Transactional
  public void ler(int user, long id) {
    if (db.update(
            "update tb_notificacao set fl_lida=true where id_notificacao=? and id_usuario=?",
            id,
            user)
        == 0) throw new RecursoNaoEncontradoException("Notificação não encontrada.");
  }
}
