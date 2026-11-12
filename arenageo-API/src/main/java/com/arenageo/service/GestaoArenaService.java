package com.arenageo.service;

import com.arenageo.dto.cadastro.*;
import com.arenageo.dto.cadastro.GestaoArenaDto.*;
import com.arenageo.entity.*;
import com.arenageo.exception.*;
import com.arenageo.mapper.CadastroMapper;
import com.arenageo.repository.*;
import com.arenageo.util.ValidacaoCadastro;
import java.time.ZoneId;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service
public class GestaoArenaService {
  private final JdbcTemplate db;
  private final ArenaRepository arenas;
  private final EmpresaRepository empresas;
  private final EnderecoRepository enderecos;
  private final CadastroMapper mapper;
  private final ObjectMapper json;

  public GestaoArenaService(
      JdbcTemplate db,
      ArenaRepository a,
      EmpresaRepository e,
      EnderecoRepository n,
      CadastroMapper m,
      ObjectMapper json) {
    this.db = db;
    arenas = a;
    empresas = e;
    enderecos = n;
    mapper = m;
    this.json = json;
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> empresas(Integer user) {
    return db.queryForList(
        "select e.id_empresa as id,e.nm_nome_fantasia as name from tb_empresa e join tb_pessoa p on"
            + " p.id_pessoa=e.id_pessoa_responsavel where p.id_usuario=? and e.fl_ativo order by"
            + " e.id_empresa",
        user);
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> listar(Integer user) {
    return db.queryForList(
        "select a.id_arena as id,a.nm_nome as name,a.nm_status_publicacao as"
            + " status,e.nm_nome_fantasia as company from tb_arena a join tb_empresa e"
            + " using(id_empresa) join tb_pessoa p on p.id_pessoa=e.id_pessoa_responsavel where"
            + " p.id_usuario=? and e.fl_ativo order by a.id_arena",
        user);
  }

  private ArenaEntity propria(Integer user, Integer id, boolean lock) {
    var rows =
        db.queryForList(
            "select a.id_arena from tb_arena a join tb_empresa e using(id_empresa) join tb_pessoa p"
                + " on p.id_pessoa=e.id_pessoa_responsavel where a.id_arena=? and p.id_usuario=?"
                + " and e.fl_ativo"
                + (lock ? " for update of a" : ""),
            id,
            user);
    if (rows.isEmpty())
      throw new RecursoNaoEncontradoException("Arena não encontrada nesta conta.");
    return arenas.findById(id).orElseThrow();
  }

  @Transactional
  public Map<String, Integer> criar(Integer user, Integer company, NovaArenaDto d) {
    var e =
        empresas
            .findById(company)
            .filter(
                v ->
                    Boolean.TRUE.equals(v.getFlAtivo())
                        && v.getPessoaResponsavel().getUsuario().getIdUsuario().equals(user))
            .orElseThrow(
                () -> new RecursoNaoEncontradoException("Empresa não encontrada nesta conta."));
    ValidacaoCadastro.telefone(d.arena().phone(), true, "arena.phone");
    ValidacaoCadastro.website(d.arena().website(), "arena.website");
    var a = arenas.save(mapper.criarArena(e, d.arena()));
    enderecos.save(mapper.criarEnderecoArena(a, d.address(), "ARENA"));
    enderecos.flush();
    return Map.of("id", a.getIdArena());
  }

  @Transactional(readOnly = true)
  public GestaoArenaDto ler(Integer user, Integer id) {
    var a = propria(user, id, false);
    var e = enderecos.findByArena_IdArenaAndFlPrincipalTrue(id).orElseThrow();
    var dados =
        new CadastroEmpresaRequestDto.ArenaDto(
            a.getNmNome(),
            a.getDsDescricao(),
            a.getNmUrlImagem(),
            a.getNmTelefone(),
            a.getNmEmail(),
            a.getNmWebsite(),
            a.getNmInstagram(),
            a.getDsHorarioFuncionamento());
    var address =
        new EnderecoCadastroDto(
            e.getNmCep(),
            e.getNmUf(),
            e.getNmCidade(),
            e.getNmBairro(),
            e.getNmLogradouro(),
            e.getNmNumero(),
            e.getNmComplemento(),
            e.getNrLatitude(),
            e.getNrLongitude());
    var spaces =
        db.query(
            "select * from tb_espaco where id_arena=? order by id_espaco",
            (rs, n) ->
                new EspacoDto(
                    rs.getString("nm_nome"),
                    db.queryForList(
                        "select id_esporte from tb_espaco_esporte where id_espaco=? order by"
                            + " id_esporte",
                        Integer.class,
                        rs.getLong("id_espaco")),
                    rs.getBoolean("fl_coberto"),
                    rs.getString("nm_piso"),
                    (Integer) rs.getObject("nr_capacidade"),
                    rs.getObject("nr_largura") == null ? null : rs.getDouble("nr_largura"),
                    rs.getObject("nr_comprimento") == null ? null : rs.getDouble("nr_comprimento")),
            id);
    var hours =
        db.query(
            "select * from tb_arena_horario where id_arena=? order by nr_dia,nr_inicio",
            (rs, n) ->
                new HorarioDto(rs.getInt("nr_dia"), rs.getInt("nr_inicio"), rs.getInt("nr_fim")),
            id);
    var exceptions =
        db.query(
            "select * from tb_arena_excecao where id_arena=? order by dt_data",
            (rs, n) ->
                new ExcecaoDto(
                    rs.getDate("dt_data").toLocalDate(),
                    Arrays.asList(json.readValue(rs.getString("ds_periodos"), PeriodoDto[].class))),
            id);
    return new GestaoArenaDto(
        dados,
        address,
        spaces,
        hours,
        db.queryForObject("select nm_fuso from tb_arena where id_arena=?", String.class, id),
        exceptions,
        "PUBLICADO".equals(a.getStatusPublicacao()));
  }

  public static void validarHorarios(List<HorarioDto> hours) {
    List<int[]> intervals = new ArrayList<>();
    for (var h : hours) {
      if (h.end() <= h.start() || h.end() > h.start() + 1440)
        throw new RegraNegocioException(
            "SCHEDULE_INVALID",
            "hours",
            "O fim deve ser após o início, com duração máxima de 24 horas.");
      int start = h.day() * 1440 + h.start(), end = h.day() * 1440 + h.end();
      intervals.add(new int[] {start, end});
      intervals.add(new int[] {start + 10080, end + 10080});
    }
    intervals.sort(Comparator.comparingInt(v -> v[0]));
    for (int i = 1; i < intervals.size(); i++)
      if (intervals.get(i)[0] < intervals.get(i - 1)[1])
        throw new RegraNegocioException(
            "SCHEDULE_INVALID",
            "hours",
            "Há horários sobrepostos, inclusive na passagem da meia-noite.");
  }

  @Transactional
  public GestaoArenaDto salvar(Integer user, Integer id, GestaoArenaDto d) {
    var a = propria(user, id, true);
    validarHorarios(d.hours());
    try {
      ZoneId.of(d.timezone());
    } catch (Exception ex) {
      throw new RegraNegocioException("TIMEZONE_INVALID", "timezone", "Selecione um fuso válido.");
    }
    Set<java.time.LocalDate> dates = new HashSet<>();
    for (var exception : d.exceptions()) {
      if (!dates.add(exception.date()))
        throw new RegraNegocioException(
            "SCHEDULE_INVALID", "exceptions", "Há datas de exceção repetidas.");
      validarHorarios(
          exception.periods().stream().map(p -> new HorarioDto(0, p.start(), p.end())).toList());
    }
    // Check exceptional periods against neighbouring exceptional/regular days as well.
    var byDate =
        d.exceptions().stream()
            .collect(java.util.stream.Collectors.toMap(ExcecaoDto::date, ExcecaoDto::periods));
    Set<java.time.LocalDate> affected = new HashSet<>();
    for (var date : byDate.keySet()) {
      affected.add(date.minusDays(1));
      affected.add(date);
      affected.add(date.plusDays(1));
    }
    List<long[]> actual = new ArrayList<>();
    for (var date : affected) {
      var periods =
          byDate.containsKey(date)
              ? byDate.get(date)
              : d.hours().stream()
                  .filter(h -> h.day() == date.getDayOfWeek().getValue() % 7)
                  .map(h -> new PeriodoDto(h.start(), h.end()))
                  .toList();
      for (var period : periods)
        actual.add(
            new long[] {
              date.toEpochDay() * 1440 + period.start(), date.toEpochDay() * 1440 + period.end()
            });
    }
    actual.sort(Comparator.comparingLong(v -> v[0]));
    for (int i = 1; i < actual.size(); i++)
      if (actual.get(i)[0] < actual.get(i - 1)[1])
        throw new RegraNegocioException(
            "SCHEDULE_INVALID",
            "exceptions",
            "Uma exceção sobrepõe o funcionamento do dia seguinte.");
    ValidacaoCadastro.telefone(d.arena().phone(), true, "arena.phone");
    ValidacaoCadastro.website(d.arena().website(), "arena.website");
    if (d.publish()
        && (d.spaces().isEmpty()
            || d.hours().isEmpty()
            || blank(d.address().street())
            || blank(d.address().number())
            || blank(d.address().neighborhood())))
      throw new RegraNegocioException(
          "ARENA_INCOMPLETE",
          "publish",
          "Para publicar, informe endereço completo, pelo menos um espaço e horários de"
              + " funcionamento.");
    var e = enderecos.findByArena_IdArenaAndFlPrincipalTrue(id).orElseThrow();
    e.setNmCidade(d.address().city().trim());
    e.setNmUf(d.address().state());
    e.setNmCep(com.arenageo.util.DocumentoUtils.somenteDigitos(d.address().zipCode()));
    e.setNmBairro(d.address().neighborhood());
    e.setNmLogradouro(d.address().street());
    e.setNmNumero(d.address().number());
    e.setNmComplemento(d.address().complement());
    e.setNrLatitude(d.address().latitude());
    e.setNrLongitude(d.address().longitude());
    a.setNmNome(d.arena().name().trim());
    a.setDsDescricao(d.arena().description() == null ? "" : d.arena().description());
    a.setNmTelefone(ValidacaoCadastro.telefone(d.arena().phone(), true, "arena.phone"));
    a.setNmEmail(d.arena().email().trim().toLowerCase(Locale.ROOT));
    a.setNmWebsite(d.arena().website());
    a.setNmInstagram(d.arena().instagram());
    a.setDsHorarioFuncionamento(d.arena().openingHours() == null ? "" : d.arena().openingHours());
    a.setStatusPublicacao(
        d.publish() ? "PUBLICADO" : d.spaces().isEmpty() ? "INCOMPLETO" : "RASCUNHO");
    db.update("update tb_arena set nm_fuso=? where id_arena=?", d.timezone(), id);
    db.update("delete from tb_espaco where id_arena=?", id);
    for (var space : d.spaces()) {
      Long spaceId =
          db.queryForObject(
              "insert into"
                  + " tb_espaco(id_arena,nm_nome,fl_coberto,nm_piso,nr_capacidade,nr_largura,nr_comprimento)"
                  + " values(?,?,?,?,?,?,?) returning id_espaco",
              Long.class,
              id,
              space.name().trim(),
              space.covered(),
              space.floor(),
              space.capacity(),
              space.width(),
              space.length());
      Set<Integer> sports = new HashSet<>();
      for (Integer sport : space.sportIds()) {
        if (!sports.add(sport)
            || !Boolean.TRUE.equals(
                db.queryForObject(
                    "select exists(select 1 from tb_esporte where id_esporte=? and fl_ativo)",
                    Boolean.class,
                    sport)))
          throw new RegraNegocioException(
              "CATALOG_ITEM_UNAVAILABLE",
              "spaces",
              "Selecione modalidades ativas, sem repetição, em cada espaço.");
        db.update("insert into tb_espaco_esporte values(?,?)", spaceId, sport);
      }
    }
    db.update("delete from tb_arena_horario where id_arena=?", id);
    for (var h : d.hours())
      db.update("insert into tb_arena_horario values(?,?,?,?)", id, h.day(), h.start(), h.end());
    db.update("delete from tb_arena_excecao where id_arena=?", id);
    for (var x : d.exceptions())
      db.update(
          "insert into tb_arena_excecao values(?,?,?::jsonb)",
          id,
          x.date(),
          json.writeValueAsString(x.periods()));
    arenas.flush();
    return ler(user, id);
  }

  private EmpresaEntity empresaPropria(Integer user, Integer id) {
    return empresas
        .findById(id)
        .filter(
            e ->
                Boolean.TRUE.equals(e.getFlAtivo())
                    && e.getPessoaResponsavel().getUsuario().getIdUsuario().equals(user))
        .orElseThrow(
            () -> new RecursoNaoEncontradoException("Empresa não encontrada nesta conta."));
  }

  @Transactional(readOnly = true)
  public EditarEmpresaDto lerEmpresa(Integer user, Integer id) {
    var e = empresaPropria(user, id);
    var a = enderecos.findByEmpresa_IdEmpresaAndFlPrincipalTrue(id).orElseThrow();
    return new EditarEmpresaDto(
        new CadastroEmpresaRequestDto.EmpresaDto(
            e.getNmRazaoSocial(),
            e.getNmNomeFantasia(),
            e.getNmCnpj(),
            e.getNmInscricaoEstadual(),
            e.getNmTelefoneComercial(),
            e.getNmEmailComercial()),
        new EnderecoCadastroDto(
            a.getNmCep(),
            a.getNmUf(),
            a.getNmCidade(),
            a.getNmBairro(),
            a.getNmLogradouro(),
            a.getNmNumero(),
            a.getNmComplemento(),
            a.getNrLatitude(),
            a.getNrLongitude()));
  }

  @Transactional
  public EditarEmpresaDto salvarEmpresa(Integer user, Integer id, EditarEmpresaDto d) {
    var e = empresaPropria(user, id);
    var c = d.company();
    if (!com.arenageo.util.DocumentoUtils.cnpjValido(c.cnpj()))
      throw new RegraNegocioException("CNPJ_INVALID", "company.cnpj", "Informe um CNPJ válido.");
    e.setNmRazaoSocial(c.legalName().trim());
    e.setNmNomeFantasia(c.tradeName().trim());
    e.setNmCnpj(com.arenageo.util.DocumentoUtils.normalizarCnpj(c.cnpj()));
    e.setNmInscricaoEstadual(c.stateRegistration());
    e.setNmTelefoneComercial(
        ValidacaoCadastro.telefone(c.businessPhone(), true, "company.businessPhone"));
    e.setNmEmailComercial(c.businessEmail());
    var a = enderecos.findByEmpresa_IdEmpresaAndFlPrincipalTrue(id).orElseThrow();
    a.setNmCep(com.arenageo.util.DocumentoUtils.somenteDigitos(d.address().zipCode()));
    a.setNmUf(d.address().state());
    a.setNmCidade(d.address().city());
    a.setNmBairro(d.address().neighborhood());
    a.setNmLogradouro(d.address().street());
    a.setNmNumero(d.address().number());
    a.setNmComplemento(d.address().complement());
    a.setNrLatitude(d.address().latitude());
    a.setNrLongitude(d.address().longitude());
    empresas.flush();
    return lerEmpresa(user, id);
  }

  private boolean blank(String v) {
    return v == null || v.isBlank();
  }
}
