package com.arenageo.service;

import com.arenageo.dto.reserva.ReservaDtos.*;
import com.arenageo.exception.*;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
public class ReservaService {
  private final JdbcTemplate db;
  private final ObjectMapper json;

  public ReservaService(JdbcTemplate db, ObjectMapper json) {
    this.db = db;
    this.json = json;
  }

  private static final String SPACE =
      "select s.id_espaco as id,s.id_arena as \"arenaId\",s.nm_nome as name,a.nm_nome as"
          + " arena,a.nm_fuso as timezone,a.nm_status_publicacao as publication,a.fl_ativo as"
          + " active,s.fl_ativo as \"spaceActive\",e.fl_ativo as \"companyActive\",p.id_usuario as"
          + " owner from tb_espaco s join tb_arena a using(id_arena) join tb_empresa e"
          + " using(id_empresa) join tb_pessoa p on p.id_pessoa=e.id_pessoa_responsavel where"
          + " s.id_espaco=?";
  private static final String CONFIG =
      "select fl_online as online,nr_preco_hora_centavos as \"hourlyCents\",nr_minutos as"
          + " \"durationMinutes\",nr_preparo as \"preparationMinutes\",nr_cancelamento_horas as"
          + " \"cancellationHours\",ds_politica as policy,nr_versao as version from"
          + " tb_espaco_reserva_config where id_espaco=?";
  private static final String BOOK =
      "select r.id_reserva as id,r.id_espaco as \"spaceId\",s.nm_nome as space,a.id_arena as"
          + " \"arenaId\",a.nm_nome as arena,r.id_usuario as customer,p.id_usuario as"
          + " owner,r.nm_tipo as type,r.nm_status as status,r.dt_inicio as start,r.dt_fim as"
          + " \"end\",r.nm_fuso as timezone,r.nr_total_centavos as \"totalCents\",r.ds_politica as"
          + " policy,r.nr_cancelamento_horas as \"cancellationHours\",r.nm_pagamento as"
          + " payment,r.nr_versao as version,r.ds_motivo as reason,r.dt_checkin as checkin from"
          + " tb_reserva r join tb_espaco s using(id_espaco) join tb_arena a using(id_arena) join"
          + " tb_empresa e using(id_empresa) join tb_pessoa p on"
          + " p.id_pessoa=e.id_pessoa_responsavel";

  private Map<String, Object> one(String sql, Object... args) {
    var rows = db.queryForList(sql, args);
    if (rows.isEmpty()) throw new RecursoNaoEncontradoException("Registro não encontrado.");
    return rows.getFirst();
  }

  private static int number(Map<String, Object> m, String key) {
    return ((Number) m.get(key)).intValue();
  }

  private static boolean flag(Map<String, Object> m, String key) {
    return Boolean.TRUE.equals(m.get(key));
  }

  private static Instant instant(Object value) {
    return value instanceof Timestamp t ? t.toInstant() : ((OffsetDateTime) value).toInstant();
  }

  private static OffsetDateTime date(Instant i) {
    return i.atOffset(ZoneOffset.UTC);
  }

  private static void invalid(String field, String text) {
    throw new RegraNegocioException("BOOKING_INVALID", field, text);
  }

  private static void conflict(String text) {
    throw new CadastroDuplicadoException("BOOKING_CONFLICT", null, text);
  }

  private Map<String, Object> space(long id, boolean lock) {
    return one(SPACE + (lock ? " for update of a" : ""), id);
  }

  private void owner(Map<String, Object> s, int user) {
    if (number(s, "owner") != user)
      throw new RecursoNaoEncontradoException("Espaço não encontrado nesta conta.");
  }

  private void published(Map<String, Object> s) {
    if (!flag(s, "active")
        || !flag(s, "spaceActive")
        || !flag(s, "companyActive")
        || !"PUBLICADO".equals(s.get("publication")))
      throw new RecursoNaoEncontradoException("Espaço indisponível para reserva.");
  }

  private Map<String, Object> config(long id) {
    var rows = db.queryForList(CONFIG, id);
    if (rows.isEmpty()) invalid("spaceId", "Este espaço ainda não recebe reservas online.");
    return rows.getFirst();
  }

  private static Instant local(LocalDateTime value, ZoneId zone) {
    var offsets = zone.getRules().getValidOffsets(value);
    if (offsets.size() != 1)
      invalid("start", "Horário inexistente ou ambíguo neste fuso. Escolha outro horário.");
    return value.toInstant(offsets.getFirst());
  }

  private static void future(Instant start) {
    if (!start.isAfter(Instant.now()) || start.isAfter(Instant.now().plus(Duration.ofDays(180))))
      invalid("start", "Selecione um horário futuro nos próximos 180 dias.");
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> spaces(int arena) {
    if (!Boolean.TRUE.equals(
        db.queryForObject(
            "select exists(select 1 from tb_arena a join tb_empresa e using(id_empresa) where"
                + " a.id_arena=? and a.fl_ativo and e.fl_ativo and"
                + " a.nm_status_publicacao='PUBLICADO')",
            Boolean.class,
            arena))) throw new RecursoNaoEncontradoException("Arena não encontrada.");
    return db.queryForList(
        "select s.id_espaco as id,s.nm_nome as name,s.fl_coberto as covered,s.nm_piso as"
            + " floor,s.nr_capacidade as capacity,coalesce(c.fl_online,false) as"
            + " online,c.nr_preco_hora_centavos as \"hourlyCents\",c.nr_minutos as"
            + " \"durationMinutes\" from tb_espaco s left join tb_espaco_reserva_config c"
            + " using(id_espaco) where s.id_arena=? and s.fl_ativo order by s.id_espaco",
        arena);
  }

  @Transactional(readOnly = true)
  public Map<String, Object> readConfig(int user, long id) {
    owner(space(id, false), user);
    var rows = db.queryForList(CONFIG, id);
    return rows.isEmpty()
        ? Map.of(
            "online",
            false,
            "hourlyCents",
            0,
            "durationMinutes",
            60,
            "preparationMinutes",
            0,
            "cancellationHours",
            0,
            "policy",
            "",
            "version",
            0)
        : rows.getFirst();
  }

  @Transactional
  public Map<String, Object> saveConfig(int user, long id, Config c) {
    var s = space(id, true);
    owner(s, user);
    if (!flag(s, "spaceActive")) invalid("spaceId", "Espaço inativo.");
    if (c.durationMinutes() % 15 != 0) invalid("durationMinutes", "Use múltiplos de 15 minutos.");
    var old = db.queryForList(CONFIG, id);
    if ((old.isEmpty() ? 0 : number(old.getFirst(), "version")) != c.version())
      conflict("A configuração mudou. Atualize a página antes de salvar.");
    db.update(
        "insert into tb_espaco_reserva_config values (?,?,?,?,?,?,?,1) on conflict(id_espaco) do"
            + " update set"
            + " fl_online=excluded.fl_online,nr_preco_hora_centavos=excluded.nr_preco_hora_centavos,nr_minutos=excluded.nr_minutos,nr_preparo=excluded.nr_preparo,nr_cancelamento_horas=excluded.nr_cancelamento_horas,ds_politica=excluded.ds_politica,nr_versao=tb_espaco_reserva_config.nr_versao+1",
        id,
        c.online(),
        c.hourlyCents(),
        c.durationMinutes(),
        c.preparationMinutes(),
        c.cancellationHours(),
        c.policy().trim());
    return readConfig(user, id);
  }

  private List<int[]> periods(int arena, LocalDate day) {
    var special =
        db.queryForList(
            "select ds_periodos::text as periods from tb_arena_excecao where id_arena=? and"
                + " dt_data=?",
            arena,
            day);
    if (!special.isEmpty()) {
      var node = json.readTree((String) special.getFirst().get("periods"));
      var result = new ArrayList<int[]>();
      for (var p : node) result.add(new int[] {p.get("start").asInt(), p.get("end").asInt()});
      return result;
    }
    return db.query(
        "select nr_inicio,nr_fim from tb_arena_horario where id_arena=? and nr_dia=?",
        (rs, n) -> new int[] {rs.getInt(1), rs.getInt(2)},
        arena,
        day.getDayOfWeek().getValue() % 7);
  }

  private List<Instant[]> opening(Map<String, Object> s, LocalDate day) {
    var zone = ZoneId.of((String) s.get("timezone"));
    int arena = number(s, "arenaId");
    var result = new ArrayList<Instant[]>();
    for (var d = day.minusDays(1); !d.isAfter(day.plusDays(1)); d = d.plusDays(1)) {
      boolean nextException =
          Boolean.TRUE.equals(
              db.queryForObject(
                  "select exists(select 1 from tb_arena_excecao where id_arena=? and dt_data=?)",
                  Boolean.class,
                  arena,
                  d.plusDays(1)));
      for (var p : periods(arena, d)) {
        var a = d.atStartOfDay().plusMinutes(p[0]);
        var b = d.atStartOfDay().plusMinutes(nextException ? Math.min(p[1], 1440) : p[1]);
        if (zone.getRules().getValidOffsets(a).size() == 1
            && zone.getRules().getValidOffsets(b).size() == 1)
          result.add(new Instant[] {local(a, zone), local(b, zone)});
      }
    }
    return result;
  }

  private List<Instant[]> occupied(long id, Instant a, Instant b) {
    return db.query(
        "select dt_inicio,dt_fim_bloqueio from tb_reserva where id_espaco=? and"
            + " nm_status<>'CANCELADA' and dt_inicio<? and dt_fim_bloqueio>?",
        (rs, n) -> new Instant[] {rs.getTimestamp(1).toInstant(), rs.getTimestamp(2).toInstant()},
        id,
        date(b),
        date(a));
  }

  private static boolean available(
      Instant start, Instant end, List<Instant[]> hours, List<Instant[]> busy) {
    return hours.stream().anyMatch(p -> !start.isBefore(p[0]) && !end.isAfter(p[1]))
        && busy.stream().noneMatch(p -> start.isBefore(p[1]) && end.isAfter(p[0]));
  }

  private void checkSlot(long id, Map<String, Object> s, Instant start, Instant end) {
    future(start);
    var zone = ZoneId.of((String) s.get("timezone"));
    if (!available(
        start, end, opening(s, start.atZone(zone).toLocalDate()), occupied(id, start, end)))
      conflict("Este horário não está disponível. Consulte a agenda novamente.");
  }

  @Transactional(readOnly = true)
  public Map<String, Object> availability(long id, LocalDate day) {
    var s = space(id, false);
    published(s);
    var c = config(id);
    if (!flag(c, "online")) invalid("spaceId", "Reservas online desativadas neste espaço.");
    var zone = ZoneId.of((String) s.get("timezone"));
    if (day.isBefore(LocalDate.now(zone)) || day.isAfter(LocalDate.now(zone).plusDays(180)))
      invalid("date", "Consulte os próximos 180 dias.");
    var hours = opening(s, day);
    var busy =
        occupied(
            id, day.atStartOfDay(zone).toInstant(), day.plusDays(2).atStartOfDay(zone).toInstant());
    var slots = new ArrayList<String>();
    for (int minute = 0; minute < 1440; minute += 15) {
      var dt = day.atStartOfDay().plusMinutes(minute);
      if (zone.getRules().getValidOffsets(dt).size() != 1) continue;
      var start = local(dt, zone);
      var end =
          start.plusSeconds((number(c, "durationMinutes") + number(c, "preparationMinutes")) * 60L);
      if (start.isAfter(Instant.now()) && available(start, end, hours, busy))
        slots.add(dt.toString());
    }
    return Map.of(
        "space",
        s.get("name"),
        "arena",
        s.get("arena"),
        "timezone",
        zone.getId(),
        "config",
        c,
        "slots",
        slots);
  }

  @Transactional
  public Map<String, Object> quote(int user, Quote q) {
    var s = space(q.spaceId(), true);
    published(s);
    var c = config(q.spaceId());
    if (!flag(c, "online")) invalid("spaceId", "Reservas online desativadas.");
    if (q.start().getMinute() % 15 != 0 || q.start().getSecond() != 0 || q.start().getNano() != 0)
      invalid("start", "Escolha um horário da agenda, em intervalos de 15 minutos.");
    var start = local(q.start(), ZoneId.of((String) s.get("timezone")));
    var end = start.plusSeconds(number(c, "durationMinutes") * 60L);
    checkSlot(q.spaceId(), s, start, end.plusSeconds(number(c, "preparationMinutes") * 60L));
    long total = (number(c, "hourlyCents") * (long) number(c, "durationMinutes") + 59) / 60;
    var id = UUID.randomUUID();
    var expires = Instant.now().plusSeconds(600);
    db.update(
        "insert into tb_reserva_orcamento values (?,?,?,?,?,?,?,?,?,?,?,?)",
        id,
        user,
        q.spaceId(),
        number(c, "version"),
        date(start),
        date(end),
        date(expires),
        total,
        number(c, "preparationMinutes"),
        number(c, "cancellationHours"),
        c.get("policy"),
        s.get("timezone"));
    return Map.of(
        "quoteId",
        id,
        "space",
        s.get("name"),
        "arena",
        s.get("arena"),
        "start",
        start.toString(),
        "end",
        end.toString(),
        "expires",
        expires.toString(),
        "totalCents",
        total,
        "policy",
        c.get("policy"),
        "cancellationHours",
        c.get("cancellationHours"),
        "timezone",
        s.get("timezone"));
  }

  @Transactional
  public Map<String, Object> confirm(int user, Confirm body) {
    if (!body.accepted()) invalid("accepted", "Aceite as condições da reserva.");
    var q =
        one(
            "select * from tb_reserva_orcamento where id_orcamento=? and id_usuario=?",
            body.quoteId(),
            user);
    long sid = ((Number) q.get("id_espaco")).longValue();
    var s = space(sid, true);
    var existing =
        db.queryForList("select id_reserva from tb_reserva where id_orcamento=?", body.quoteId());
    if (!existing.isEmpty())
      return detail(user, ((Number) existing.getFirst().get("id_reserva")).longValue());
    published(s);
    var c = config(sid);
    if (!flag(c, "online")
        || number(c, "version") != number(q, "nr_versao")
        || !instant(q.get("dt_expira")).isAfter(Instant.now()))
      conflict("O orçamento expirou ou as condições mudaram. Gere e revise um novo orçamento.");
    var start = instant(q.get("dt_inicio"));
    var end = instant(q.get("dt_fim"));
    var blocked = end.plusSeconds(number(q, "nr_preparo") * 60L);
    checkSlot(sid, s, start, blocked);
    long id =
        db.queryForObject(
            "insert into"
                + " tb_reserva(id_espaco,id_usuario,id_autor,id_orcamento,nm_tipo,dt_inicio,dt_fim,dt_fim_bloqueio,nm_fuso,nr_total_centavos,nr_cancelamento_horas,ds_politica,nm_pagamento)"
                + " values (?,?,?,?,'RESERVA',?,?,?,?,?,?,?,'PENDENTE_LOCAL') returning id_reserva",
            Long.class,
            sid,
            user,
            user,
            body.quoteId(),
            date(start),
            date(end),
            date(blocked),
            q.get("nm_fuso"),
            q.get("nr_total_centavos"),
            q.get("nr_cancelamento_horas"),
            q.get("ds_politica"));
    event(id, user, "CRIAR", null);
    return detail(user, id);
  }

  private void event(long id, int user, String action, String reason) {
    db.update(
        "insert into tb_reserva_evento(id_reserva,id_autor,nm_acao,ds_motivo) values (?,?,?,?)",
        id,
        user,
        action,
        reason);
  }

  private Map<String, Object> view(Map<String, Object> row, int user) {
    var result = new LinkedHashMap<>(row);
    result.put("canManage", number(row, "owner") == user);
    result.remove("customer");
    result.remove("owner");
    for (var key : List.of("start", "end", "checkin"))
      if (result.get(key) != null) result.put(key, instant(result.get(key)).toString());
    return result;
  }

  @Transactional(readOnly = true)
  public Map<String, Object> detail(int user, long id) {
    var row = one(BOOK + " where r.id_reserva=?", id);
    if (number(row, "owner") != user && !Objects.equals(row.get("customer"), user))
      throw new RecursoNaoEncontradoException("Reserva não encontrada nesta conta.");
    var result = view(row, user);
    result.put(
        "events",
        db.queryForList(
            "select nm_acao as action,ds_motivo as reason,dt_criado as date from tb_reserva_evento"
                + " where id_reserva=? order by id_evento",
            id));
    return result;
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> mine(int user, int page) {
    if (page < 0 || page > 10000) invalid("page", "Página inválida.");
    return db
        .queryForList(
            BOOK
                + " where r.id_usuario=? order by r.dt_inicio desc,r.id_reserva desc limit 20"
                + " offset ?",
            user,
            page * 20)
        .stream()
        .map(r -> view(r, user))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> agenda(int user, int arena, LocalDate day) {
    var rows =
        db.queryForList(
            "select a.nm_fuso from tb_arena a join tb_empresa e using(id_empresa) join tb_pessoa p"
                + " on p.id_pessoa=e.id_pessoa_responsavel where a.id_arena=? and p.id_usuario=?",
            arena,
            user);
    if (rows.isEmpty())
      throw new RecursoNaoEncontradoException("Arena não encontrada nesta conta.");
    var zone = ZoneId.of((String) rows.getFirst().get("nm_fuso"));
    return db
        .queryForList(
            BOOK
                + " where a.id_arena=? and r.dt_inicio<? and r.dt_fim>? order by"
                + " r.dt_inicio,r.id_reserva",
            arena,
            date(day.plusDays(1).atStartOfDay(zone).toInstant()),
            date(day.atStartOfDay(zone).toInstant()))
        .stream()
        .map(r -> view(r, user))
        .toList();
  }

  @Transactional
  public Map<String, Object> block(int user, Block b) {
    var s = space(b.spaceId(), true);
    owner(s, user);
    if (!flag(s, "spaceActive")) invalid("spaceId", "Espaço inativo.");
    var zone = ZoneId.of((String) s.get("timezone"));
    var start = local(b.start(), zone);
    var end = local(b.end(), zone);
    future(start);
    if (!end.isAfter(start) || Duration.between(start, end).toHours() > 168)
      invalid("end", "Informe um intervalo de até 7 dias.");
    if (!occupied(b.spaceId(), start, end).isEmpty())
      conflict("Há reserva ou bloqueio neste intervalo. Resolva o conflito antes de bloquear.");
    long id =
        db.queryForObject(
            "insert into"
                + " tb_reserva(id_espaco,id_autor,nm_tipo,dt_inicio,dt_fim,dt_fim_bloqueio,nm_fuso,nr_total_centavos,nr_cancelamento_horas,ds_politica,nm_pagamento,ds_motivo)"
                + " values (?,?,'BLOQUEIO',?,?,?,?,0,0,'Bloqueio operacional','NAO_APLICAVEL',?)"
                + " returning id_reserva",
            Long.class,
            b.spaceId(),
            user,
            date(start),
            date(end),
            date(end),
            zone.getId(),
            b.reason().trim());
    event(id, user, "BLOQUEAR", b.reason());
    return detail(user, id);
  }

  @Transactional
  public Map<String, Object> action(int user, long id, Action a) {
    var before = one(BOOK + " where r.id_reserva=?", id);
    space(((Number) before.get("spaceId")).longValue(), true);
    var r = one(BOOK + " where r.id_reserva=? for update of r", id);
    boolean manager = number(r, "owner") == user;
    if (!manager && !Objects.equals(r.get("customer"), user))
      throw new RecursoNaoEncontradoException("Reserva não encontrada nesta conta.");
    if (number(r, "version") != a.version())
      conflict("A reserva mudou. Atualize a página antes de continuar.");
    if (!"CONFIRMADA".equals(r.get("status"))) conflict("Esta reserva já foi encerrada.");
    String action = a.action(), status = "CONFIRMADA";
    var now = Instant.now();
    if ("CANCELAR".equals(action)) {
      if (a.reason() == null || a.reason().trim().length() < 5)
        invalid("reason", "Informe o motivo do cancelamento (mínimo 5 caracteres).");
      if (!manager
          && !now.isBefore(
              instant(r.get("start")).minusSeconds(number(r, "cancellationHours") * 3600L)))
        conflict("O prazo de cancelamento online terminou. Procure a arena.");
      if ("RECEBIDO_LOCAL".equals(r.get("payment")))
        conflict(
            "Há recebimento registrado. Procure a arena para resolver a devolução antes de"
                + " cancelar.");
      status = "CANCELADA";
    } else {
      if (!manager || !"RESERVA".equals(r.get("type")))
        throw new RecursoNaoEncontradoException("Ação não disponível nesta conta.");
      switch (action) {
        case "CHECKIN" -> {
          if (now.isBefore(instant(r.get("start")).minusSeconds(3600))
              || !now.isBefore(instant(r.get("end"))))
            conflict("Check-in disponível de uma hora antes do início até o fim da reserva.");
          if (r.get("checkin") != null) conflict("Check-in já registrado.");
          db.update("update tb_reserva set dt_checkin=current_timestamp where id_reserva=?", id);
        }
        case "RECEBER_LOCAL" -> {
          if ("RECEBIDO_LOCAL".equals(r.get("payment"))) conflict("Recebimento já registrado.");
          db.update("update tb_reserva set nm_pagamento='RECEBIDO_LOCAL' where id_reserva=?", id);
        }
        case "CONCLUIR", "FALTA" -> {
          if (now.isBefore(instant(r.get("end")))) conflict("Aguarde o fim do horário reservado.");
          if ("FALTA".equals(action) && r.get("checkin") != null)
            conflict("Esta reserva possui check-in.");
          status = "FALTA".equals(action) ? "NAO_COMPARECEU" : "CONCLUIDA";
        }
        default -> invalid("action", "Ação inválida.");
      }
    }
    db.update(
        "update tb_reserva set nm_status=?,ds_motivo=coalesce(?,ds_motivo),nr_versao=nr_versao+1"
            + " where id_reserva=?",
        status,
        a.reason(),
        id);
    event(id, user, action, a.reason());
    return detail(user, id);
  }
}
