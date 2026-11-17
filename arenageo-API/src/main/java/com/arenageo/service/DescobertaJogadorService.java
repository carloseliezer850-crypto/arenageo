package com.arenageo.service;

import com.arenageo.exception.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DescobertaJogadorService {
  private final JdbcTemplate db;

  public DescobertaJogadorService(JdbcTemplate db) {
    this.db = db;
  }

  public record Slot(
      @Min(1) @Max(7) int day, @Min(0) @Max(1439) int start, @Min(1) @Max(1440) int end) {}

  public record Config(
      boolean visible,
      @NotBlank @Size(max = 80) String name,
      @NotBlank @Size(max = 120) String city,
      @NotBlank String state,
      @NotNull @Size(max = 500) String bio,
      @NotBlank String timezone,
      @NotNull LocalDate validUntil,
      @Min(0) int revision,
      @NotNull @Size(max = 28) List<@Valid @NotNull Slot> slots) {}

  private static final Set<String> UFS =
      Set.of(
          "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
          "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO");

  private int own(int user) {
    var ids =
        db.queryForList(
            "select j.id_jogador from tb_jogador j join tb_pessoa p using(id_pessoa) where"
                + " p.id_usuario=? and j.fl_ativo",
            Integer.class,
            user);
    if (ids.isEmpty()) throw new RecursoNaoEncontradoException("Perfil de jogador não encontrado.");
    return ids.getFirst();
  }

  @Transactional(readOnly = true)
  public Object config(int user) {
    int id = own(user);
    var rows =
        db.queryForList(
            "select fl_visivel as visible,nm_publico as name,nm_cidade as city,nm_uf as"
                + " state,ds_bio as bio,nm_fuso as timezone,dt_validade as"
                + " \"validUntil\",nr_revisao as revision from tb_jogador_descoberta where"
                + " id_jogador=?",
            id);
    if (rows.isEmpty())
      return Map.of(
          "visible",
          false,
          "name",
          "",
          "city",
          "",
          "state",
          "RS",
          "bio",
          "",
          "timezone",
          "America/Sao_Paulo",
          "validUntil",
          LocalDate.now(ZoneId.of("America/Sao_Paulo")).plusDays(30).toString(),
          "revision",
          0,
          "slots",
          List.of());
    var r = rows.getFirst();
    r.put("slots", slots(id));
    return r;
  }

  private List<Map<String, Object>> slots(int id) {
    return db.queryForList(
        "select nr_dia as day,nr_inicio as start,nr_fim as end from tb_jogador_disponibilidade"
            + " where id_jogador=? order by nr_dia,nr_inicio",
        id);
  }

  @Transactional
  public Object save(int user, Config c) {
    int id = own(user);
    db.queryForList("select id_jogador from tb_jogador where id_jogador=? for update", id);
    if (!ZoneId.getAvailableZoneIds().contains(c.timezone())
        || !Boolean.TRUE.equals(
            db.queryForObject(
                "select exists(select 1 from pg_timezone_names where name=?)",
                Boolean.class,
                c.timezone()))) throw invalid("timezone", "Selecione um fuso IANA válido.");
    ZoneId zone;
    try {
      zone = ZoneId.of(c.timezone());
    } catch (DateTimeException e) {
      throw invalid("timezone", "Selecione um fuso válido.");
    }
    var today = LocalDate.now(zone);
    if (!UFS.contains(c.state())) throw invalid("state", "Selecione uma UF válida.");
    if (c.validUntil().isBefore(today) || c.validUntil().isAfter(today.plusDays(90)))
      throw invalid("validUntil", "A validade deve estar entre hoje e os próximos 90 dias.");
    if (c.visible() && c.slots().isEmpty())
      throw invalid("slots", "Informe ao menos um horário para aparecer na busca.");
    var ordered =
        c.slots().stream()
            .sorted(Comparator.comparingInt(Slot::day).thenComparingInt(Slot::start))
            .toList();
    Slot previous = null;
    for (var s : ordered) {
      if (s.start() >= s.end()
          || (previous != null && previous.day() == s.day() && s.start() < previous.end()))
        throw invalid(
            "slots",
            "Revise os horários: início deve preceder fim, sem sobreposição no mesmo dia.");
      previous = s;
    }
    var versions =
        db.queryForList(
            "select nr_revisao from tb_jogador_descoberta where id_jogador=?", Integer.class, id);
    if ((versions.isEmpty() ? 0 : versions.getFirst()) != c.revision())
      throw new CadastroDuplicadoException(
          "VERSION_CONFLICT",
          null,
          "As preferências mudaram em outra aba. Atualize a página antes de salvar.");
    db.update(
        "insert into"
            + " tb_jogador_descoberta(id_jogador,fl_visivel,nm_publico,nm_cidade,nm_uf,ds_bio,nm_fuso,dt_validade,nr_revisao)"
            + " values (?,?,?,?,?,?,?,?,1) on conflict(id_jogador) do update set"
            + " fl_visivel=excluded.fl_visivel,nm_publico=excluded.nm_publico,nm_cidade=excluded.nm_cidade,nm_uf=excluded.nm_uf,ds_bio=excluded.ds_bio,nm_fuso=excluded.nm_fuso,dt_validade=excluded.dt_validade,nr_revisao=tb_jogador_descoberta.nr_revisao+1",
        id,
        c.visible(),
        c.name().trim(),
        c.city().trim(),
        c.state(),
        c.bio().trim(),
        c.timezone(),
        c.validUntil());
    db.update("delete from tb_jogador_disponibilidade where id_jogador=?", id);
    for (var s : ordered)
      db.update(
          "insert into tb_jogador_disponibilidade(id_jogador,nr_dia,nr_inicio,nr_fim) values"
              + " (?,?,?,?)",
          id,
          s.day(),
          s.start(),
          s.end());
    return config(user);
  }

  private RegraNegocioException invalid(String field, String message) {
    return new RegraNegocioException("SEARCH_INVALID", field, message);
  }

  private static final String FROM =
      " from tb_jogador_descoberta d join tb_jogador j using(id_jogador) join tb_pessoa p"
          + " using(id_pessoa) join tb_usuario u on u.id_usuario=p.id_usuario";
  private static final String VISIBLE =
      " d.fl_visivel and j.fl_ativo and u.fl_ativo and d.dt_validade >= (current_timestamp at time"
          + " zone d.nm_fuso)::date";
  private static final String SELECT =
      "select d.id_jogador as id,d.nm_publico as name,p.nm_nome_usuario as username,d.nm_cidade as"
          + " city,d.nm_uf as state,d.ds_bio as bio,d.nm_fuso as timezone,d.dt_validade as"
          + " \"validUntil\"";

  private String fold(String expr) {
    return "translate(lower(" + expr + "),'áàâãäéèêëíìîïóòôõöúùûüç','aaaaaeeeeiiiiooooouuuuc')";
  }

  @Transactional(readOnly = true)
  public Object search(
      String query,
      String city,
      String state,
      Integer sport,
      Integer level,
      LocalDate date,
      String period,
      int page) {
    if (query.length() > 80
        || city.length() > 120
        || (!state.isEmpty() && !UFS.contains(state))
        || page < 0
        || page > 10000
        || sport != null && sport < 1
        || level != null && level < 1
        || level != null && sport == null)
      throw invalid(null, "Revise os filtros. Para filtrar por nível, escolha também um esporte.");
    int lo = 0, hi = 1440;
    switch (period) {
      case "" -> {}
      case "manha" -> {
        lo = 360;
        hi = 720;
      }
      case "tarde" -> {
        lo = 720;
        hi = 1080;
      }
      case "noite" -> {
        lo = 1080;
        hi = 1440;
      }
      case "madrugada" -> {
        lo = 0;
        hi = 360;
      }
      default -> throw invalid("period", "Período inválido.");
    }
    if (!period.isEmpty() && date == null)
      throw invalid("date", "Escolha a data para filtrar por período.");
    var args = new ArrayList<Object>();
    String where = " where " + VISIBLE;
    where += " and position(" + fold("?") + " in " + fold("d.nm_publico") + ")>0";
    args.add(query.trim());
    if (!city.isBlank()) {
      where += " and " + fold("d.nm_cidade") + "=" + fold("?");
      args.add(city.trim());
    }
    if (!state.isEmpty()) {
      where += " and d.nm_uf=?";
      args.add(state);
    }
    if (sport != null) {
      where +=
          " and exists(select 1 from tb_jogador_esporte je join tb_esporte e using(id_esporte) join"
              + " tb_nivel_habilidade n using(id_nivel_habilidade) where je.id_jogador=d.id_jogador"
              + " and e.fl_ativo and n.fl_ativo and je.id_esporte=?";
      args.add(sport);
      if (level != null) {
        where += " and je.id_nivel_habilidade=?";
        args.add(level);
      }
      where += ")";
    }
    if (date != null) {
      where +=
          " and ?::date between (current_timestamp at time zone d.nm_fuso)::date and d.dt_validade"
              + " and exists(select 1 from tb_jogador_disponibilidade a where"
              + " a.id_jogador=d.id_jogador and a.nr_dia=extract(isodow from ?::date) and"
              + " a.nr_inicio<? and a.nr_fim>?)";
      args.add(date);
      args.add(date);
      args.add(hi);
      args.add(lo);
    }
    long total = db.queryForObject("select count(*)" + FROM + where, Long.class, args.toArray());
    args.add(20);
    args.add(page * 20);
    var rows =
        db.queryForList(
            SELECT + FROM + where + " order by lower(d.nm_publico),d.id_jogador limit ? offset ?",
            args.toArray());
    enrich(rows);
    return Map.of("items", rows, "total", total, "page", page, "size", 20);
  }

  private void enrich(List<Map<String, Object>> rows) {
    if (rows.isEmpty()) return;
    String marks = String.join(",", Collections.nCopies(rows.size(), "?"));
    Object[] ids = rows.stream().map(r -> r.get("id")).toArray();
    var sports =
        db.queryForList(
            "select je.id_jogador as player,je.id_esporte as id,e.nm_esporte as"
                + " name,je.id_nivel_habilidade as \"levelId\",n.nm_nivel_habilidade as level from"
                + " tb_jogador_esporte je join tb_esporte e using(id_esporte) join"
                + " tb_nivel_habilidade n using(id_nivel_habilidade) where e.fl_ativo and"
                + " n.fl_ativo and je.id_jogador in ("
                + marks
                + ") order by e.nm_esporte",
            ids);
    var times =
        db.queryForList(
            "select id_jogador as player,nr_dia as day,nr_inicio as start,nr_fim as end from"
                + " tb_jogador_disponibilidade where id_jogador in ("
                + marks
                + ") order by nr_dia,nr_inicio",
            ids);
    for (var r : rows) {
      r.put(
          "sports",
          sports.stream()
              .filter(s -> s.get("player").equals(r.get("id")))
              .map(
                  s -> {
                    var v = new HashMap<>(s);
                    v.remove("player");
                    return v;
                  })
              .toList());
      r.put(
          "slots",
          times.stream()
              .filter(s -> s.get("player").equals(r.get("id")))
              .map(
                  s -> {
                    var v = new HashMap<>(s);
                    v.remove("player");
                    return v;
                  })
              .toList());
    }
  }

  @Transactional(readOnly = true)
  public Object detail(int id) {
    var rows = db.queryForList(SELECT + FROM + " where " + VISIBLE + " and d.id_jogador=?", id);
    if (rows.isEmpty()) throw new RecursoNaoEncontradoException("Perfil público não encontrado.");
    enrich(rows);
    return rows.getFirst();
  }
}
