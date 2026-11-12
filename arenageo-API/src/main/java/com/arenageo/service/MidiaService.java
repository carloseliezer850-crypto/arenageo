package com.arenageo.service;

import com.arenageo.exception.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MidiaService {
  private final JdbcTemplate db;

  public MidiaService(JdbcTemplate db) {
    this.db = db;
  }

  private void autorizar(Integer user, Integer arena) {
    if (arena != null
        && !Boolean.TRUE.equals(
            db.queryForObject(
                "select exists(select 1 from tb_arena a join tb_empresa e using(id_empresa) join"
                    + " tb_pessoa p on p.id_pessoa=e.id_pessoa_responsavel where a.id_arena=? and"
                    + " p.id_usuario=? and e.fl_ativo)",
                Boolean.class,
                arena,
                user)))
      throw new RecursoNaoEncontradoException("Arena não encontrada nesta conta.");
  }

  @Transactional
  public Map<String, Object> salvar(Integer user, Integer arena, MultipartFile file) {
    autorizar(user, arena);
    db.queryForList("select id_usuario from tb_usuario where id_usuario=? for update", user);
    if (file.getSize() > 5 * 1024 * 1024)
      throw new ResponseStatusException(
          HttpStatus.PAYLOAD_TOO_LARGE, "A imagem deve ter até 5 MB.");
    byte[] bytes;
    try (var input = ImageIO.createImageInputStream(file.getInputStream())) {
      var readers = ImageIO.getImageReaders(input);
      if (!readers.hasNext()) throw new IOException();
      var reader = readers.next();
      try {
        reader.setInput(input, true, true);
        String format = reader.getFormatName().toLowerCase(Locale.ROOT);
        if (!Set.of("jpeg", "jpg", "png", "webp").contains(format)
            || reader.getWidth(0) > 8000
            || reader.getHeight(0) > 8000
            || (long) reader.getWidth(0) * reader.getHeight(0) > 20000000) throw new IOException();
        var original = reader.read(0);
        var image =
            new BufferedImage(
                original.getWidth(), original.getHeight(), BufferedImage.TYPE_INT_ARGB);
        var graphics = image.createGraphics();
        graphics.drawImage(original, 0, 0, null);
        graphics.dispose();
        var out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        bytes = out.toByteArray();
        if (bytes.length > 5 * 1024 * 1024)
          throw new ResponseStatusException(
              HttpStatus.PAYLOAD_TOO_LARGE, "Reduza a resolução da imagem.");
      } finally {
        reader.dispose();
      }
    } catch (IOException e) {
      throw new ResponseStatusException(
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          "Use uma imagem JPG, PNG ou WebP válida, com até 20 megapixels.");
    }
    if (arena == null)
      db.update("delete from tb_midia where id_usuario=? and id_arena is null", user);
    else if (db.queryForObject(
            "select count(*) from tb_midia where id_arena=?", Integer.class, arena)
        >= 10)
      throw new RegraNegocioException("GALLERY_LIMIT", null, "A galeria permite até 10 imagens.");
    UUID id = UUID.randomUUID();
    int order =
        arena == null
            ? 0
            : db.queryForObject(
                "select coalesce(max(nr_ordem),-1)+1 from tb_midia where id_arena=?",
                Integer.class,
                arena);
    db.update(
        "insert into tb_midia(id_midia,id_usuario,id_arena,ds_conteudo,nr_ordem) values(?,?,?,?,?)",
        id,
        user,
        arena,
        bytes,
        order);
    String url = "/api/midias/" + id;
    if (arena == null)
      db.update("update tb_pessoa set nm_url_foto_perfil=? where id_usuario=?", url, user);
    else if (order == 0)
      db.update("update tb_arena set nm_url_imagem=? where id_arena=?", url, arena);
    return Map.of("id", id, "url", url);
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> listar(Integer user, Integer arena) {
    autorizar(user, arena);
    return db.queryForList(
        "select id_midia as id,nr_ordem as position from tb_midia where id_usuario=? and "
            + (arena == null ? "id_arena is null" : "id_arena=?")
            + " order by nr_ordem,id_midia",
        arena == null ? new Object[] {user} : new Object[] {user, arena});
  }

  @Transactional(readOnly = true)
  public byte[] ler(Integer user, UUID id) {
    var rows =
        db.query(
            "select ds_conteudo from tb_midia where id_midia=? and id_usuario=?",
            (rs, n) -> rs.getBytes(1),
            id,
            user);
    if (rows.isEmpty()) throw new RecursoNaoEncontradoException("Imagem não encontrada.");
    return rows.getFirst();
  }

  @Transactional
  public void excluir(Integer user, UUID id) {
    db.queryForList("select id_usuario from tb_usuario where id_usuario=? for update", user);
    if (db.update("delete from tb_midia where id_midia=? and id_usuario=?", id, user) == 0)
      throw new RecursoNaoEncontradoException("Imagem não encontrada.");
    db.update(
        "update tb_pessoa set nm_url_foto_perfil=null where id_usuario=? and nm_url_foto_perfil=?",
        user,
        "/api/midias/" + id);
    db.update("update tb_arena set nm_url_imagem=null where nm_url_imagem=?", "/api/midias/" + id);
  }

  @Transactional
  public void ordenar(Integer user, Integer arena, List<UUID> ids) {
    autorizar(user, arena);
    db.queryForList("select id_usuario from tb_usuario where id_usuario=? for update", user);
    var existing =
        db.queryForList(
            "select id_midia from tb_midia where id_arena=? and id_usuario=?",
            UUID.class,
            arena,
            user);
    if (ids == null
        || ids.size() != existing.size()
        || new HashSet<>(ids).size() != ids.size()
        || !new HashSet<>(ids).equals(new HashSet<>(existing)))
      throw new RegraNegocioException(
          "GALLERY_INVALID", null, "A seleção de imagens não corresponde à galeria.");
    for (int i = 0; i < ids.size(); i++)
      db.update("update tb_midia set nr_ordem=? where id_midia=?", i, ids.get(i));
    db.update(
        "update tb_arena set nm_url_imagem=? where id_arena=?",
        ids.isEmpty() ? null : "/api/midias/" + ids.getFirst(),
        arena);
  }
}
