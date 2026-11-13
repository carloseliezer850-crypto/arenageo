package com.arenageo.service;

import static org.junit.jupiter.api.Assertions.*;

import com.arenageo.dto.cadastro.*;
import com.arenageo.dto.cadastro.CadastroJogadorRequestDto.*;
import com.arenageo.exception.*;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
      "spring.config.import=",
      "spring.jpa.hibernate.ddl-auto=validate",
      "security.jwt.secret-base64=YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE="
    })
class CadastroIntegracaoTest {
  static final EmbeddedPostgres pg;

  static {
    try {
      pg =
          EmbeddedPostgres.builder()
              .setPort(0)
              .setServerConfig("unix_socket_directories", "")
              .start();
      try (var c = pg.getPostgresDatabase().getConnection();
          var s = c.createStatement();
          var files = Files.list(Path.of("../supabase/migrations"))) {
        s.execute(
            "create role anon; create role authenticated; alter default privileges grant all on"
                + " tables to anon, authenticated;");
        for (var f : files.filter(p -> p.toString().endsWith(".sql")).sorted().toList())
          s.execute(Files.readString(f));
      }
    } catch (Exception e) {
      throw new ExceptionInInitializerError(e);
    }
  }

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", () -> pg.getJdbcUrl("postgres", "postgres"));
    r.add("spring.datasource.username", () -> "postgres");
    r.add("spring.datasource.password", () -> "");
  }

  @org.springframework.beans.factory.annotation.Value("${local.server.port}")
  int port;

  @Autowired ContaService conta;
  @Autowired MidiaService midia;
  @Autowired EventCapture capture;

  @org.springframework.boot.test.context.TestConfiguration
  static class Events {
    @org.springframework.context.annotation.Bean
    EventCapture capture() {
      return new EventCapture();
    }
  }

  static class EventCapture {
    final java.util.List<ContaService.EmailEvento> events =
        new java.util.concurrent.CopyOnWriteArrayList<>();

    @org.springframework.context.event.EventListener
    public void receive(ContaService.EmailEvento e) {
      events.add(e);
    }
  }

  @Autowired CadastroJogadorService jogadores;
  @Autowired PerfilJogadorService perfil;
  @Autowired CadastroEmpresaService empresas;
  @Autowired GestaoArenaService gestao;
  @Autowired IdempotenciaService idem;
  @Autowired JdbcTemplate db;

  @BeforeEach
  void clean() {
    capture.events.clear();
    db.execute("drop trigger if exists test_commit on tb_jogador_esporte");
    db.execute(
        "truncate"
            + " tb_midia,tb_token_conta,tb_idempotencia,tb_arena_excecao,tb_arena_horario,tb_espaco_esporte,tb_espaco,tb_endereco,tb_arena,tb_empresa,tb_jogador_esporte,tb_jogador,tb_pessoa,tb_usuario"
            + " restart identity cascade");
  }

  static EnderecoCadastroDto address(String city) {
    return new EnderecoCadastroDto(
        "96400000", "RS", city, "Centro", "Rua Teste", "123", "", null, null);
  }

  CadastroJogadorRequestDto player() {
    var sports =
        db.queryForList(
            "select id_esporte from tb_esporte where fl_ativo order by id_esporte limit 2",
            Integer.class);
    var levels =
        db.queryForList(
            "select id_nivel_habilidade from tb_nivel_habilidade where fl_ativo order by"
                + " id_nivel_habilidade limit 2",
            Integer.class);
    return new CadastroJogadorRequestDto(
        new DadosJogadorDto(
            "Jogador Teste",
            "jogador.teste",
            "jogador@example.test",
            null,
            "53999999999",
            "529.982.247-25",
            "",
            "frase de senha teste"),
        address("Bagé"),
        List.of(
            new EsporteJogadorDto(sports.get(0), levels.get(0)),
            new EsporteJogadorDto(sports.get(1), levels.get(1))));
  }

  @Test
  void salvaReleEditaDoisEsportes() {
    var result = jogadores.cadastrar(player());
    assertEquals(2, db.queryForObject("select count(*) from tb_jogador_esporte", Integer.class));
    var saved = perfil.ler(result.user().id());
    assertEquals(player().sports(), saved.sports());
    perfil.salvar(
        result.user().id(),
        new PerfilJogadorDto(
            saved.name(), saved.phone(), saved.address(), saved.sports().subList(1, 2)));
    assertEquals(1, perfil.ler(result.user().id()).sports().size());
    assertEquals(1, db.queryForObject("select count(*) from tb_usuario", Integer.class));
  }

  @Test
  void editaPerfilComCepOpcionalOuFormatado() {
    var request = player();
    var minimal = new EnderecoCadastroDto(null, "RS", "Bagé", null, null, null, null, null, null);
    var result =
        jogadores.cadastrar(
            new CadastroJogadorRequestDto(request.user(), minimal, request.sports()));
    for (String cep : new String[] {null, "", "96400-000", ""}) {
      var saved = perfil.ler(result.user().id());
      var address = new EnderecoCadastroDto(cep, "RS", "Bagé", null, null, null, null, null, null);
      perfil.salvar(
          result.user().id(),
          new PerfilJogadorDto(
              "Nome atualizado", saved.phone(), address, saved.sports().subList(0, 1)));
      var reloaded = perfil.ler(result.user().id());
      assertEquals("Nome atualizado", reloaded.name());
      assertEquals(1, reloaded.sports().size());
      assertEquals(cep == null || cep.isEmpty() ? null : "96400000", reloaded.address().zipCode());
    }
  }

  @Test
  void invalidoReverteGrafoInteiro() {
    var p = player();
    var invalid =
        new CadastroJogadorRequestDto(
            p.user(),
            p.address(),
            List.of(
                p.sports().getFirst(),
                new EsporteJogadorDto(Integer.MAX_VALUE, p.sports().getFirst().skillLevelId())));
    assertThrows(RegraNegocioException.class, () -> jogadores.cadastrar(invalid));
    assertEquals(0, db.queryForObject("select count(*) from tb_usuario", Integer.class));
    assertEquals(0, db.queryForObject("select count(*) from tb_endereco", Integer.class));
  }

  @Test
  void falhaNoCommitNaoDeixaConta() {
    db.execute(
        "create or replace function test_fail() returns trigger language plpgsql as $$ begin raise"
            + " exception 'synthetic commit failure'; end $$");
    db.execute(
        "create constraint trigger test_commit after insert on tb_jogador_esporte deferrable"
            + " initially deferred for each row execute function test_fail()");
    assertThrows(RuntimeException.class, () -> jogadores.cadastrar(player()));
    assertEquals(0, db.queryForObject("select count(*) from tb_usuario", Integer.class));
  }

  @Test
  void sementeReexecutavel() throws Exception {
    db.execute(
        Files.readString(Path.of("../supabase/migrations/20261112145142_cadastro_completo.sql")));
    assertEquals(3, db.queryForObject("select count(*) from tb_nivel_habilidade", Integer.class));
  }

  @Test
  void repeticaoConcorrenteNaoDuplica() throws Exception {
    var p = player();
    try (var executor = Executors.newFixedThreadPool(2)) {
      Callable<Object> call =
          () ->
              idem.executar(
                  "chave-de-teste-concorrente", "Jogador", p, () -> jogadores.cadastrar(p));
      var all = executor.invokeAll(List.of(call, call));
      for (var future : all) assertNotNull(future.get());
    }
    assertEquals(1, db.queryForObject("select count(*) from tb_usuario", Integer.class));
    assertEquals(2, db.queryForObject("select count(*) from tb_jogador_esporte", Integer.class));
    assertThrows(
        CadastroDuplicadoException.class,
        () ->
            idem.executar(
                "chave-de-teste-concorrente", "Jogador", Map.of("different", true), () -> null));
  }

  @Test
  void jogadorAbreEmpresaComEnderecoSeparadoESegundaArena() {
    var player = jogadores.cadastrar(player());
    var company =
        new CadastroEmpresaRequestDto.EmpresaDto(
            "Empresa Teste",
            "Arena Teste",
            "12.ABC.345/01DE-35",
            "ISENTO",
            "53999999999",
            "empresa@example.test");
    var arena =
        new CadastroEmpresaRequestDto.ArenaDto(
            "Arena", "", null, "53999999999", "arena@example.test", "https://example.test", "", "");
    var request =
        new CadastroEmpresaRequestDto.EmpresaDaContaDto(
            company, address("Pelotas"), arena, address("Bagé"));
    var result = empresas.cadastrarNaConta(player.user().id(), request);
    assertEquals(1, db.queryForObject("select count(*) from tb_usuario", Integer.class));
    assertEquals(2, db.queryForObject("select count(*) from tb_jogador_esporte", Integer.class));
    assertEquals(
        "Bagé",
        db.queryForObject(
            "select nm_cidade from tb_endereco where id_arena is not null", String.class));
    assertEquals(
        "Pelotas",
        db.queryForObject(
            "select nm_cidade from tb_endereco where id_empresa is not null", String.class));
    var second =
        gestao.criar(
            player.user().id(), result.idPerfil(), new NovaArenaDto(arena, address("Bagé")));
    assertEquals(2, gestao.listar(player.user().id()).size());
    assertThrows(RecursoNaoEncontradoException.class, () -> gestao.ler(999, second.get("id")));
  }

  @Test
  void horarioSobrepostoEntreDiasERejeitado() {
    assertThrows(
        RegraNegocioException.class,
        () ->
            GestaoArenaService.validarHorarios(
                List.of(
                    new GestaoArenaDto.HorarioDto(6, 1380, 1500),
                    new GestaoArenaDto.HorarioDto(0, 30, 90))));
  }

  @Test
  void confirmacaoRecuperacaoUsoUnicoERevogacao() throws Exception {
    var user = jogadores.cadastrar(player());
    var verification = capture.events.getLast();
    conta.consumir(verification.token(), "VERIFY", null);
    assertEquals(true, conta.estado(user.user().id()).get("verified"));
    assertThrows(
        RegraNegocioException.class, () -> conta.consumir(verification.token(), "VERIFY", null));
    conta.recuperar("jogador@example.test");
    var reset = capture.events.getLast();
    conta.consumir(reset.token(), "RESET", "outra frase de senha");
    assertThrows(
        RegraNegocioException.class,
        () -> conta.consumir(reset.token(), "RESET", "outra frase de senha"));
    var request =
        java.net.http.HttpRequest.newBuilder(
                java.net.URI.create("http://localhost:" + port + "/jogadores/me"))
            .header("Authorization", "Bearer " + user.token())
            .build();
    assertEquals(
        401,
        java.net.http.HttpClient.newHttpClient()
            .send(request, java.net.http.HttpResponse.BodyHandlers.ofString())
            .statusCode());
    conta.recuperar("ausente@example.test");
    assertEquals(2, capture.events.size());
  }

  @Test
  void imagemRealPersisteERejeitaArquivoAlheio() throws Exception {
    var user = jogadores.cadastrar(player());
    var image = new java.awt.image.BufferedImage(10, 10, java.awt.image.BufferedImage.TYPE_INT_RGB);
    var bytes = new java.io.ByteArrayOutputStream();
    javax.imageio.ImageIO.write(image, "png", bytes);
    var result =
        midia.salvar(
            user.user().id(),
            null,
            new org.springframework.mock.web.MockMultipartFile(
                "file", "teste.png", "image/png", bytes.toByteArray()));
    var id = (java.util.UUID) result.get("id");
    assertTrue(midia.ler(user.user().id(), id).length > 0);
    assertThrows(RecursoNaoEncontradoException.class, () -> midia.ler(999, id));
    assertThrows(RecursoNaoEncontradoException.class, () -> midia.excluir(999, id));
    assertThrows(
        org.springframework.web.server.ResponseStatusException.class,
        () ->
            midia.salvar(
                user.user().id(),
                null,
                new org.springframework.mock.web.MockMultipartFile(
                    "file", "falso.png", "image/png", "nao e uma imagem".getBytes())));
  }

  @Test
  void apiPreservaErrosAninhados() throws Exception {
    var req =
        java.net.http.HttpRequest.newBuilder(
                java.net.URI.create("http://localhost:" + port + "/jogadores"))
            .header("Content-Type", "application/json")
            .POST(
                java.net.http.HttpRequest.BodyPublishers.ofString(
                    "{\"user\":{},\"address\":{},\"sports\":[]}"))
            .build();
    var response =
        java.net.http.HttpClient.newHttpClient()
            .send(req, java.net.http.HttpResponse.BodyHandlers.ofString());
    assertEquals(400, response.statusCode());
    assertTrue(response.body().contains("user.cpf"));
    assertTrue(response.body().contains("VALIDATION_ERROR"));
    assertTrue(response.body().contains("traceId"));
    assertEquals(0, db.queryForObject("select count(*) from tb_usuario", Integer.class));
  }

  @Test
  void dataApiNaoRecebeGrantsImplicitos() {
    assertFalse(
        Boolean.TRUE.equals(
            db.queryForObject(
                "select has_table_privilege('anon','public.tb_usuario','TRUNCATE') or"
                    + " has_table_privilege('authenticated','public.tb_midia','SELECT')",
                Boolean.class)));
  }

  @Test
  void publicarExigeEstruturaEIsolaEmpresa() {
    var u = jogadores.cadastrar(player());
    var company =
        new CadastroEmpresaRequestDto.EmpresaDto(
            "Empresa", "Empresa", "12ABC34501DE35", "", "53999999999", "publicacao@example.test");
    var arena =
        new CadastroEmpresaRequestDto.ArenaDto(
            "Arena", "", null, "53999999999", "arena@example.test", "", "", "");
    var result =
        empresas.cadastrarNaConta(
            u.user().id(),
            new CadastroEmpresaRequestDto.EmpresaDaContaDto(
                company, address("Bagé"), arena, address("Bagé")));
    int id = ((Number) gestao.listar(u.user().id()).getFirst().get("id")).intValue();
    var saved = gestao.ler(u.user().id(), id);
    assertThrows(
        RegraNegocioException.class,
        () ->
            gestao.salvar(
                u.user().id(),
                id,
                new GestaoArenaDto(
                    saved.arena(),
                    saved.address(),
                    saved.spaces(),
                    saved.hours(),
                    saved.timezone(),
                    saved.exceptions(),
                    true)));
    var spaces =
        List.of(
            new GestaoArenaDto.EspacoDto(
                null,
                "Quadra",
                List.of(player().sports().getFirst().sportId()),
                true,
                "Madeira",
                10,
                20.0,
                40.0));
    var hours = List.of(new GestaoArenaDto.HorarioDto(1, 480, 1080));
    assertTrue(
        gestao
            .salvar(
                u.user().id(),
                id,
                new GestaoArenaDto(
                    saved.arena(),
                    saved.address(),
                    spaces,
                    hours,
                    saved.timezone(),
                    List.of(),
                    true))
            .publish());
    var first = gestao.ler(u.user().id(), id);
    Long spaceId = first.spaces().getFirst().id();
    var second = gestao.salvar(u.user().id(), id, first);
    assertEquals(spaceId, second.spaces().getFirst().id());
    assertEquals(
        1, db.queryForObject("select count(*) from tb_espaco where id_arena=?", Integer.class, id));
    var invalid =
        new GestaoArenaDto.EspacoDto(
            99999L, "Inválida", spaces.getFirst().sportIds(), true, "", 10, 20.0, 40.0);
    assertThrows(
        RegraNegocioException.class,
        () ->
            gestao.salvar(
                u.user().id(),
                id,
                new GestaoArenaDto(
                    first.arena(),
                    first.address(),
                    List.of(invalid),
                    first.hours(),
                    first.timezone(),
                    first.exceptions(),
                    true)));
    gestao.salvar(
        u.user().id(),
        id,
        new GestaoArenaDto(
            first.arena(),
            first.address(),
            List.of(),
            first.hours(),
            first.timezone(),
            first.exceptions(),
            false));
    assertFalse(
        db.queryForObject(
            "select fl_ativo from tb_espaco where id_espaco=?", Boolean.class, spaceId));
    assertTrue(gestao.ler(u.user().id(), id).spaces().isEmpty());
    assertThrows(
        RecursoNaoEncontradoException.class, () -> gestao.lerEmpresa(999, result.idPerfil()));
  }

  @Autowired QuadroService quadros;

  tools.jackson.databind.JsonNode quadroValido() {
    var mapper = new tools.jackson.databind.ObjectMapper();
    var point = Map.of("x", 0.5, "y", 0.5);
    var pieces = new java.util.ArrayList<Object>();
    for (int side = 0; side < 2; side++)
      for (int i = 0; i < 5; i++)
        pieces.add(
            Map.of(
                "id",
                side + "-" + i,
                "lado",
                side,
                "numero",
                String.valueOf(i + 1),
                "nome",
                "",
                "x",
                0.5,
                "y",
                0.5));
    return mapper.valueToTree(
        Map.of(
            "versao",
            1,
            "modalidade",
            "futsal",
            "perfil",
            "media",
            "formacoes",
            List.of("2-2", "3-1"),
            "jogadores",
            pieces,
            "bola",
            point,
            "marcacoes",
            List.of(),
            "adversario",
            true));
  }

  @Test
  void quadroPrivadoControleDeRevisaoEArquivamento() {
    var user = jogadores.cadastrar(player()).user().id();
    var other = contaParticipante("outro-quadro");
    var id = java.util.UUID.randomUUID();
    var doc = quadroValido();
    quadros.save(user, id, "Treino", doc, 0, true);
    assertThrows(RecursoNaoEncontradoException.class, () -> quadros.read(other, id));
    assertThrows(
        RecursoNaoEncontradoException.class,
        () -> quadros.save(other, id, "Invadido", doc, 0, false));
    assertTrue(quadros.list(other, "", false).isEmpty());
    quadros.save(user, id, "Revisão nova", doc, 0, false);
    assertThrows(
        CadastroDuplicadoException.class,
        () -> quadros.save(user, id, "Revisão antiga", doc, 0, false));
    assertEquals("Revisão nova", quadros.read(user, id).get("title"));
    quadros.archive(user, id, 1, true);
    assertTrue(quadros.list(user, "", false).isEmpty());
    assertEquals(1, quadros.list(user, "nova", true).size());
    assertThrows(
        CadastroDuplicadoException.class, () -> quadros.save(user, id, "Arquivado", doc, 2, false));
    quadros.archive(user, id, 2, false);
    quadros.delete(user, id, 3);
    assertTrue(quadros.list(user, "", false).isEmpty());
  }

  @Test
  void quadroRejeitaJsonInvalidoSemSubstituirDocumento() {
    int user = jogadores.cadastrar(player()).user().id();
    var id = java.util.UUID.randomUUID();
    var doc = quadroValido();
    quadros.save(user, id, "Original", doc, 0, true);
    var mapper = new tools.jackson.databind.ObjectMapper();
    for (String changed :
        List.of(
            doc.toString().replace("\"x\":0.5", "\"x\":1.5"),
            doc.toString().replace("\"id\":\"0-1\"", "\"id\":\"0-0\""),
            doc.toString().replace("\"2-2\"", "\"4-4\""),
            doc.toString().replace("\"versao\":1", "\"versao\":4294967297"),
            doc.toString().replace("\"modalidade\":\"futsal\"", "\"modalidade\":\"invalida\""))) {
      assertThrows(
          RegraNegocioException.class,
          () -> quadros.save(user, id, "Inválido", mapper.readTree(changed), 0, false));
    }
    assertEquals("Original", quadros.read(user, id).get("title"));
    assertFalse(
        Boolean.TRUE.equals(
            db.queryForObject(
                "select has_table_privilege('anon','tb_quadro_tatico','SELECT') or"
                    + " has_table_privilege('authenticated','tb_quadro_tatico','UPDATE')",
                Boolean.class)));
  }

  @Autowired ReservaService reservas;

  record ReservaFixture(int owner, int arena, long space, java.time.LocalDateTime start) {}

  ReservaFixture reservaFixture() {
    var u = jogadores.cadastrar(player());
    empresas.cadastrarNaConta(
        u.user().id(),
        new CadastroEmpresaRequestDto.EmpresaDaContaDto(
            new CadastroEmpresaRequestDto.EmpresaDto(
                    "Empresa",
                    "Empresa",
                    "12ABC34501DE35",
                    "",
                    "53999999999",
                    "reservas@example.test"),
                address("Bagé"),
            new CadastroEmpresaRequestDto.ArenaDto(
                    "Arena", "", null, "53999999999", "arena@example.test", "", "", ""),
                address("Bagé")));
    int arena = ((Number) gestao.listar(u.user().id()).getFirst().get("id")).intValue();
    var current = gestao.ler(u.user().id(), arena);
    var spaces =
        List.of(
            new GestaoArenaDto.EspacoDto(
                null,
                "Quadra",
                List.of(player().sports().getFirst().sportId()),
                true,
                "Madeira",
                10,
                20.0,
                40.0));
    var hours =
        java.util.stream.IntStream.range(0, 7)
            .mapToObj(day -> new GestaoArenaDto.HorarioDto(day, 0, 1440))
            .toList();
    var saved =
        gestao.salvar(
            u.user().id(),
            arena,
            new GestaoArenaDto(
                current.arena(),
                current.address(),
                spaces,
                hours,
                "America/Sao_Paulo",
                List.of(),
                true));
    long space = saved.spaces().getFirst().id();
    reservas.saveConfig(
        u.user().id(),
        space,
        new com.arenageo.dto.reserva.ReservaDtos.Config(
            true, 10000, 60, 0, 24, "Cancelar até 24 horas antes. Pagar no local.", 0));
    return new ReservaFixture(
        u.user().id(),
        arena,
        space,
        java.time.LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo"))
            .plusDays(3)
            .atTime(18, 0));
  }

  java.util.UUID quoteId(int user, ReservaFixture f, java.time.LocalDateTime start) {
    return (java.util.UUID)
        reservas
            .quote(user, new com.arenageo.dto.reserva.ReservaDtos.Quote(f.space(), start))
            .get("quoteId");
  }

  @Test
  void reservaUltimoHorarioConcorrenteEConstraintDireta() throws Exception {
    var f = reservaFixture();
    int a = contaParticipante("cliente1"), b = contaParticipante("cliente2");
    var qa = quoteId(a, f, f.start());
    var qb = quoteId(b, f, f.start());
    var gate = new java.util.concurrent.CountDownLatch(1);
    try (var pool = java.util.concurrent.Executors.newFixedThreadPool(2)) {
      var tasks =
          List.<java.util.concurrent.Callable<Boolean>>of(
              () -> {
                gate.await();
                try {
                  reservas.confirm(a, new com.arenageo.dto.reserva.ReservaDtos.Confirm(qa, true));
                  return true;
                } catch (CadastroDuplicadoException e) {
                  return false;
                }
              },
              () -> {
                gate.await();
                try {
                  reservas.confirm(b, new com.arenageo.dto.reserva.ReservaDtos.Confirm(qb, true));
                  return true;
                } catch (CadastroDuplicadoException e) {
                  return false;
                }
              });
      var one = pool.submit(tasks.get(0));
      var two = pool.submit(tasks.get(1));
      gate.countDown();
      assertNotEquals(one.get(), two.get());
    }
    assertEquals(1, db.queryForObject("select count(*) from tb_reserva", Integer.class));
    assertThrows(
        org.springframework.dao.DataIntegrityViolationException.class,
        () ->
            db.update(
                "insert into"
                    + " tb_reserva(id_espaco,id_autor,nm_tipo,dt_inicio,dt_fim,dt_fim_bloqueio,nm_fuso,nr_total_centavos,nr_cancelamento_horas,ds_politica,nm_pagamento)"
                    + " select"
                    + " id_espaco,id_autor,'BLOQUEIO',dt_inicio,dt_fim,dt_fim_bloqueio,nm_fuso,0,0,'Manutenção','NAO_APLICAVEL'"
                    + " from tb_reserva limit 1"));
    var next = quoteId(a, f, f.start().plusHours(1));
    reservas.confirm(a, new com.arenageo.dto.reserva.ReservaDtos.Confirm(next, true));
    assertEquals(2, db.queryForObject("select count(*) from tb_reserva", Integer.class));
  }

  @Test
  void orcamentoExigeRevisaoEReenvioNaoDuplica() {
    var f = reservaFixture();
    var id = quoteId(f.owner(), f, f.start());
    reservas.saveConfig(
        f.owner(),
        f.space(),
        new com.arenageo.dto.reserva.ReservaDtos.Config(
            true, 12000, 60, 15, 24, "Condições atualizadas de pagamento local.", 1));
    assertThrows(
        CadastroDuplicadoException.class,
        () ->
            reservas.confirm(
                f.owner(), new com.arenageo.dto.reserva.ReservaDtos.Confirm(id, true)));
    var expired = quoteId(f.owner(), f, f.start());
    db.update(
        "update tb_reserva_orcamento set dt_expira=current_timestamp-interval '1 minute' where"
            + " id_orcamento=?",
        expired);
    assertThrows(
        CadastroDuplicadoException.class,
        () ->
            reservas.confirm(
                f.owner(), new com.arenageo.dto.reserva.ReservaDtos.Confirm(expired, true)));
    var valid = quoteId(f.owner(), f, f.start());
    var body = new com.arenageo.dto.reserva.ReservaDtos.Confirm(valid, true);
    idem.executar(
        "reserva-chave-teste-123",
        "Reserva:" + f.owner(),
        body,
        () -> reservas.confirm(f.owner(), body));
    idem.executar(
        "reserva-chave-teste-123",
        "Reserva:" + f.owner(),
        body,
        () -> {
          throw new AssertionError("não repetir");
        });
    reservas.confirm(f.owner(), body);
    assertEquals(1, db.queryForObject("select count(*) from tb_reserva", Integer.class));
    assertThrows(
        CadastroDuplicadoException.class, () -> quoteId(f.owner(), f, f.start().plusHours(1)));
    assertEquals(
        12000, db.queryForObject("select nr_total_centavos from tb_reserva", Integer.class));
  }

  @Test
  void reservaPrivadaCancelamentoLiberaAgendaEPreservaHistorico() {
    var f = reservaFixture();
    int customer = contaParticipante("cliente"), other = contaParticipante("terceiro");
    long id =
        ((Number)
                reservas
                    .confirm(
                        customer,
                        new com.arenageo.dto.reserva.ReservaDtos.Confirm(
                            quoteId(customer, f, f.start()), true))
                    .get("id"))
            .longValue();
    assertThrows(RecursoNaoEncontradoException.class, () -> reservas.detail(other, id));
    assertThrows(
        RecursoNaoEncontradoException.class,
        () ->
            reservas.action(
                other,
                id,
                new com.arenageo.dto.reserva.ReservaDtos.Action("CANCELAR", 0, "Outro cliente")));
    var current = gestao.ler(f.owner(), f.arena());
    assertThrows(
        CadastroDuplicadoException.class,
        () ->
            gestao.salvar(
                f.owner(),
                f.arena(),
                new GestaoArenaDto(
                    current.arena(),
                    current.address(),
                    List.of(),
                    current.hours(),
                    current.timezone(),
                    current.exceptions(),
                    false)));
    assertThrows(
        CadastroDuplicadoException.class,
        () ->
            reservas.action(
                customer,
                id,
                new com.arenageo.dto.reserva.ReservaDtos.Action(
                    "CANCELAR", 1, "Não poderei jogar")));
    var cancelled =
        reservas.action(
            customer,
            id,
            new com.arenageo.dto.reserva.ReservaDtos.Action("CANCELAR", 0, "Não poderei jogar"));
    assertEquals("CANCELADA", cancelled.get("status"));
    quoteId(other, f, f.start());
    assertEquals(2, db.queryForObject("select count(*) from tb_reserva_evento", Integer.class));
    assertFalse(
        Boolean.TRUE.equals(
            db.queryForObject(
                "select has_table_privilege('anon','tb_reserva','SELECT') or"
                    + " has_table_privilege('authenticated','tb_reserva_orcamento','INSERT')",
                Boolean.class)));
  }

  @Test
  void excecaoTemPrioridadeIncluindoViradaDeDia() {
    var f = reservaFixture();
    var day = f.start().toLocalDate();
    db.update("delete from tb_arena_horario where id_arena=?", f.arena());
    db.update(
        "insert into tb_arena_horario values (?,?,?,?)",
        f.arena(),
        day.minusDays(1).getDayOfWeek().getValue() % 7,
        1320,
        1560);
    quoteId(f.owner(), f, day.atTime(0, 30));
    db.update("insert into tb_arena_excecao values (?,?,'[]')", f.arena(), day);
    assertThrows(CadastroDuplicadoException.class, () -> quoteId(f.owner(), f, day.atTime(0, 30)));
    db.update(
        "update tb_arena_excecao set ds_periodos='[{\"start\":1380,\"end\":1560}]' where"
            + " id_arena=?",
        f.arena());
    var q =
        reservas.quote(
            f.owner(),
            new com.arenageo.dto.reserva.ReservaDtos.Quote(f.space(), day.atTime(23, 30)));
    assertEquals(
        3600,
        java.time.Duration.between(
                java.time.Instant.parse((String) q.get("start")),
                java.time.Instant.parse((String) q.get("end")))
            .toSeconds());
    db.update("insert into tb_arena_excecao values (?,?,'[]')", f.arena(), day.plusDays(1));
    assertThrows(CadastroDuplicadoException.class, () -> quoteId(f.owner(), f, day.atTime(23, 30)));
  }

  @Test
  void bloqueioEOperacaoDaArenaRespeitamAutorizacaoEEstado() {
    var f = reservaFixture();
    int customer = contaParticipante("cliente");
    var block =
        new com.arenageo.dto.reserva.ReservaDtos.Block(
            f.space(), f.start(), f.start().plusHours(2), "Manutenção do piso");
    assertThrows(RecursoNaoEncontradoException.class, () -> reservas.block(customer, block));
    var b = reservas.block(f.owner(), block);
    assertThrows(CadastroDuplicadoException.class, () -> quoteId(customer, f, f.start()));
    reservas.action(
        f.owner(),
        ((Number) b.get("id")).longValue(),
        new com.arenageo.dto.reserva.ReservaDtos.Action("CANCELAR", 0, "Manutenção finalizada"));
    var r =
        reservas.confirm(
            customer,
            new com.arenageo.dto.reserva.ReservaDtos.Confirm(
                quoteId(customer, f, f.start()), true));
    long id = ((Number) r.get("id")).longValue();
    assertThrows(
        RecursoNaoEncontradoException.class,
        () ->
            reservas.action(
                customer,
                id,
                new com.arenageo.dto.reserva.ReservaDtos.Action("RECEBER_LOCAL", 0, null)));
    assertThrows(
        CadastroDuplicadoException.class,
        () ->
            reservas.action(
                f.owner(),
                id,
                new com.arenageo.dto.reserva.ReservaDtos.Action("CHECKIN", 0, null)));
    reservas.action(
        f.owner(), id, new com.arenageo.dto.reserva.ReservaDtos.Action("RECEBER_LOCAL", 0, null));
    assertThrows(
        CadastroDuplicadoException.class,
        () ->
            reservas.action(
                f.owner(),
                id,
                new com.arenageo.dto.reserva.ReservaDtos.Action(
                    "CANCELAR", 1, "Cancelar com valor recebido")));
    assertEquals("RECEBIDO_LOCAL", reservas.detail(customer, id).get("payment"));
  }

  @Autowired PartidaService partidas;

  int contaParticipante(String name) {
    return db.queryForObject(
        "insert into tb_usuario(id_tipo_conta,nm_email,nm_senha_hash) select"
            + " id_tipo_conta,?,nm_senha_hash from tb_usuario order by id_usuario limit 1 returning"
            + " id_usuario",
        Integer.class,
        name + "@example.test");
  }

  com.arenageo.dto.partida.PartidaRequest novaPartida(boolean publish, boolean participate) {
    return new com.arenageo.dto.partida.PartidaRequest(
        "Jogo de teste",
        player().sports().getFirst().sportId(),
        player().sports().getFirst().skillLevelId(),
        "Trazer água",
        "Quadra combinada",
        "Bagé",
        "RS",
        java.time.LocalDateTime.now()
            .plusDays(2)
            .withHour(18)
            .withMinute(0)
            .withSecond(0)
            .withNano(0),
        "America/Sao_Paulo",
        60,
        2,
        participate,
        publish);
  }

  @Test
  void partidasUltimaVagaConcorrenteEFilaSemDuplicacao() throws Exception {
    int owner = jogadores.cadastrar(player()).user().id();
    int a = contaParticipante("a"), b = contaParticipante("b");
    long id = ((Number) partidas.criar(owner, novaPartida(true, true)).get("id")).longValue();
    var gate = new CountDownLatch(1);
    try (var pool = Executors.newFixedThreadPool(2)) {
      var fa =
          pool.submit(
              () -> {
                gate.await();
                return partidas.participar(id, a, false);
              });
      var fb =
          pool.submit(
              () -> {
                gate.await();
                return partidas.participar(id, b, false);
              });
      gate.countDown();
      var ra = fa.get(10, TimeUnit.SECONDS);
      var rb = fb.get(10, TimeUnit.SECONDS);
      assertEquals(
          Set.of("CONFIRMADA", "LISTA_ESPERA"),
          Set.of(ra.get("participation"), rb.get("participation")));
      int confirmed = ra.get("participation").equals("CONFIRMADA") ? a : b;
      int waiting = confirmed == a ? b : a;
      partidas.participar(id, confirmed, false);
      assertEquals(2, ((Number) partidas.detalhe(id, owner).get("currentPlayers")).intValue());
      partidas.participar(id, confirmed, true);
      assertEquals("LISTA_ESPERA", partidas.participar(id, confirmed, false).get("participation"));
      assertEquals("CONFIRMADA", partidas.participar(id, waiting, false).get("participation"));
      assertEquals(
          3,
          db.queryForObject(
              "select count(*) from tb_partida_participante where id_partida=?",
              Integer.class,
              id));
    }
  }

  @Test
  void rascunhoPrivadoFiltrosEEstadoProtegidos() {
    int owner = jogadores.cadastrar(player()).user().id(), other = contaParticipante("other");
    var d = partidas.criar(owner, novaPartida(false, true));
    long id = ((Number) d.get("id")).longValue();
    assertThrows(RecursoNaoEncontradoException.class, () -> partidas.detalhe(id, other));
    assertThrows(RecursoNaoEncontradoException.class, () -> partidas.detalhe(id, null));
    assertEquals(0L, partidas.buscar("", "", null, null, null, 0, 12).get("total"));
    assertThrows(
        RecursoNaoEncontradoException.class,
        () -> partidas.transicao(id, other, "PUBLICADA", 0, null));
    partidas.transicao(id, owner, "PUBLICADA", 0, null);
    assertEquals(
        1L,
        partidas
            .buscar("Bage", "RS", novaPartida(true, true).sportId(), null, null, 0, 12)
            .get("total"));
    assertEquals(0L, partidas.buscar("Bagé", "SC", null, null, null, 0, 12).get("total"));
    assertThrows(
        CadastroDuplicadoException.class,
        () -> partidas.transicao(id, owner, "CANCELADA", 0, "Chuva"));
    partidas.transicao(id, owner, "CANCELADA", 1, "Chuva");
    assertThrows(CadastroDuplicadoException.class, () -> partidas.participar(id, other, false));
  }

  @Test
  void partidasRespeitamAgendaEData() {
    int owner = jogadores.cadastrar(player()).user().id();
    partidas.criar(owner, novaPartida(true, true));
    assertThrows(
        CadastroDuplicadoException.class, () -> partidas.criar(owner, novaPartida(true, true)));
    assertEquals(1, db.queryForObject("select count(*) from tb_partida", Integer.class));
    var d = novaPartida(true, false);
    var old =
        new com.arenageo.dto.partida.PartidaRequest(
            d.title(),
            d.sportId(),
            d.skillLevelId(),
            d.description(),
            d.location(),
            d.city(),
            d.state(),
            java.time.LocalDateTime.now().minusDays(1),
            d.timezone(),
            d.durationMinutes(),
            d.maxPlayers(),
            false,
            true);
    assertThrows(RegraNegocioException.class, () -> partidas.criar(owner, old));
    var dst =
        new com.arenageo.dto.partida.PartidaRequest(
            d.title(),
            d.sportId(),
            d.skillLevelId(),
            d.description(),
            d.location(),
            d.city(),
            d.state(),
            java.time.LocalDateTime.of(2027, 3, 14, 2, 30),
            "America/New_York",
            60,
            2,
            false,
            true);
    assertThrows(RegraNegocioException.class, () -> partidas.criar(owner, dst));
  }

  @Test
  void partidasIdempotenciaEApiPublica() throws Exception {
    var auth = jogadores.cadastrar(player());
    int owner = auth.user().id();
    String key = UUID.randomUUID().toString();
    var d = novaPartida(true, true);
    idem.executar(key, "Partida:" + owner, d, () -> partidas.criar(owner, d));
    idem.executar(
        key,
        "Partida:" + owner,
        d,
        () -> {
          throw new AssertionError("Replay recriou partida");
        });
    assertEquals(1, db.queryForObject("select count(*) from tb_partida", Integer.class));
    var client = java.net.http.HttpClient.newHttpClient();
    var search =
        client.send(
            java.net.http.HttpRequest.newBuilder(
                    java.net.URI.create("http://localhost:" + port + "/partidas"))
                .GET()
                .build(),
            java.net.http.HttpResponse.BodyHandlers.ofString());
    assertEquals(200, search.statusCode());
    assertFalse(search.body().contains("nm_senha_hash"));
    assertFalse(search.body().contains("@example.test"));
    var mine =
        client.send(
            java.net.http.HttpRequest.newBuilder(
                    java.net.URI.create("http://localhost:" + port + "/partidas/minhas"))
                .GET()
                .build(),
            java.net.http.HttpResponse.BodyHandlers.ofString());
    assertEquals(401, mine.statusCode());
    var invalid =
        client.send(
            java.net.http.HttpRequest.newBuilder(
                    java.net.URI.create("http://localhost:" + port + "/partidas?page=oops"))
                .GET()
                .build(),
            java.net.http.HttpResponse.BodyHandlers.ofString());
    assertEquals(400, invalid.statusCode());
    var mapper = new tools.jackson.databind.ObjectMapper();
    var payload = new LinkedHashMap<String, Object>();
    payload.put("title", "Partida com identidade forjada");
    payload.put("sportId", d.sportId());
    payload.put("skillLevelId", d.skillLevelId());
    payload.put("description", "Teste de autorização");
    payload.put("location", "Local de teste");
    payload.put("city", "Bagé");
    payload.put("state", "RS");
    payload.put("dateTime", d.dateTime().plusDays(1).toString());
    payload.put("timezone", d.timezone());
    payload.put("durationMinutes", 60);
    payload.put("maxPlayers", 2);
    payload.put("participate", false);
    payload.put("publish", true);
    payload.put("creatorId", 999999);
    var post =
        client.send(
            java.net.http.HttpRequest.newBuilder(
                    java.net.URI.create("http://localhost:" + port + "/partidas"))
                .header("Authorization", "Bearer " + auth.token())
                .header("Idempotency-Key", UUID.randomUUID().toString())
                .header("Content-Type", "application/json")
                .POST(
                    java.net.http.HttpRequest.BodyPublishers.ofString(
                        mapper.writeValueAsString(payload)))
                .build(),
            java.net.http.HttpResponse.BodyHandlers.ofString());
    assertTrue(post.statusCode() == 200 || post.statusCode() == 400);
    if (post.statusCode() == 200)
      assertEquals(
          owner, ((Number) mapper.readValue(post.body(), Map.class).get("creatorId")).intValue());
    assertEquals(
        0,
        db.queryForObject(
            "select count(*) from tb_partida where id_organizador<>?", Integer.class, owner));
    assertEquals(
        0,
        db.queryForObject(
            "select count(*) from information_schema.role_table_grants where table_schema='public'"
                + " and table_name in ('tb_partida','tb_partida_participante') and grantee in"
                + " ('anon','authenticated')",
            Integer.class));
  }
}
