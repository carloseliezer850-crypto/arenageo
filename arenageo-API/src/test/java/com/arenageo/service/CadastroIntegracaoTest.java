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
    assertThrows(
        RecursoNaoEncontradoException.class, () -> gestao.lerEmpresa(999, result.idPerfil()));
  }
}
