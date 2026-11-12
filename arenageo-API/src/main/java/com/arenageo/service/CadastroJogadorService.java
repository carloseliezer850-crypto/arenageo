package com.arenageo.service;

import com.arenageo.config.JwtTokenService;
import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.cadastro.CadastroJogadorRequestDto;
import com.arenageo.dto.cadastro.CadastroResultadoDto;
import com.arenageo.entity.*;
import com.arenageo.exception.CadastroDuplicadoException;
import com.arenageo.exception.RegraNegocioException;
import com.arenageo.mapper.AutenticacaoMapper;
import com.arenageo.mapper.CadastroMapper;
import com.arenageo.repository.*;
import com.arenageo.util.DocumentoUtils;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroJogadorService {
  private final ContaService contaService;
  private final UsuarioRepository usuarioRepository;
  private final TipoContaRepository tipoContaRepository;
  private final PessoaRepository pessoaRepository;
  private final JogadorRepository jogadorRepository;
  private final EnderecoRepository enderecoRepository;
  private final EsporteRepository esporteRepository;
  private final NivelHabilidadeRepository nivelHabilidadeRepository;
  private final JogadorEsporteRepository jogadorEsporteRepository;
  private final PasswordEncoder passwordEncoder;
  private final CadastroMapper cadastroMapper;
  private final AutenticacaoMapper autenticacaoMapper;
  private final JwtTokenService jwtTokenService;

  public CadastroJogadorService(
      UsuarioRepository usuarioRepository,
      TipoContaRepository tipoContaRepository,
      PessoaRepository pessoaRepository,
      JogadorRepository jogadorRepository,
      EnderecoRepository enderecoRepository,
      EsporteRepository esporteRepository,
      NivelHabilidadeRepository nivelHabilidadeRepository,
      JogadorEsporteRepository jogadorEsporteRepository,
      PasswordEncoder passwordEncoder,
      CadastroMapper cadastroMapper,
      AutenticacaoMapper autenticacaoMapper,
      JwtTokenService jwtTokenService,
      ContaService contaService) {
    this.contaService = contaService;
    this.usuarioRepository = usuarioRepository;
    this.tipoContaRepository = tipoContaRepository;
    this.pessoaRepository = pessoaRepository;
    this.jogadorRepository = jogadorRepository;
    this.enderecoRepository = enderecoRepository;
    this.esporteRepository = esporteRepository;
    this.nivelHabilidadeRepository = nivelHabilidadeRepository;
    this.jogadorEsporteRepository = jogadorEsporteRepository;
    this.passwordEncoder = passwordEncoder;
    this.cadastroMapper = cadastroMapper;
    this.autenticacaoMapper = autenticacaoMapper;
    this.jwtTokenService = jwtTokenService;
  }

  @Transactional
  public AuthResponseDto<CadastroResultadoDto> cadastrar(CadastroJogadorRequestDto request) {
    String email = request.user().email().trim().toLowerCase(Locale.ROOT);
    String cpf = DocumentoUtils.somenteDigitos(request.user().cpf());
    String nomeUsuario = request.user().username().trim().toLowerCase(Locale.ROOT);
    com.arenageo.util.ValidacaoCadastro.senha(
        request.user().password(),
        request.user().email(),
        request.user().username(),
        "user.password");
    com.arenageo.util.ValidacaoCadastro.telefone(request.user().phone(), false, "user.phone");

    if (!DocumentoUtils.cpfValido(request.user().cpf()))
      throw new RegraNegocioException("CPF_INVALID", "user.cpf", "Informe um CPF válido.");
    if (usuarioRepository.existsByNmEmailIgnoreCase(email))
      throw new CadastroDuplicadoException(
          "ACCOUNT_CONFLICT",
          "user.email",
          "Já existe uma conta com os dados informados. Entre ou recupere seu acesso.");
    if (pessoaRepository.existsByNmCpf(cpf))
      throw new CadastroDuplicadoException(
          "ACCOUNT_CONFLICT",
          "user.cpf",
          "Já existe uma conta com os dados informados. Entre ou recupere seu acesso.");
    if (pessoaRepository.existsByNmNomeUsuarioIgnoreCase(nomeUsuario))
      throw new CadastroDuplicadoException(
          "USERNAME_IN_USE", "user.username", "Este nome de usuário já está em uso.");

    TipoContaEntity tipoConta =
        tipoContaRepository
            .findByNmCodigoAndFlAtivoTrue("JOGADOR")
            .orElseThrow(
                () ->
                    new RegraNegocioException(
                        "Tipo de conta JOGADOR não foi configurado no banco."));

    UsuarioEntity usuario =
        cadastroMapper.criarUsuario(
            tipoConta, email, passwordEncoder.encode(request.user().password()));
    usuarioRepository.save(usuario);

    PessoaEntity pessoa =
        cadastroMapper.criarPessoa(
            usuario,
            request.user().name(),
            cpf,
            converterDataNascimento(request.user().birthDate()),
            request.user().phone(),
            nomeUsuario,
            request.user().profileImageUrl());
    pessoaRepository.save(pessoa);

    JogadorEntity jogador = cadastroMapper.criarJogador(pessoa);
    jogadorRepository.save(jogador);
    enderecoRepository.save(
        cadastroMapper.criarEnderecoPessoa(pessoa, request.address(), "RESIDENCIAL"));

    salvarEsportes(request, jogador);
    jogadorEsporteRepository.flush();

    contaService.emitir(usuario.getIdUsuario(), "VERIFY");
    String token = jwtTokenService.gerarToken(usuario, false);
    CadastroResultadoDto resultado = new CadastroResultadoDto(jogador.getIdJogador(), "JOGADOR");
    return autenticacaoMapper.respostaSucesso(
        usuario, "Cadastro de jogador realizado com sucesso.", resultado, token);
  }

  private void salvarEsportes(CadastroJogadorRequestDto request, JogadorEntity jogador) {
    if (request.sports() == null || request.sports().isEmpty())
      throw new RegraNegocioException(
          "SPORTS_REQUIRED", "sports", "Selecione pelo menos um esporte.");
    Set<Integer> esportesInformados = new HashSet<>();
    for (int i = 0; i < request.sports().size(); i++) {
      var dados = request.sports().get(i);
      String field = "sports[" + i + "]";
      if (!esportesInformados.add(dados.sportId()))
        throw new RegraNegocioException(
            "SPORTS_DUPLICATED", field + ".sportId", "Remova o esporte repetido.");
      EsporteEntity esporte =
          esporteRepository
              .findByIdEsporteAndFlAtivoTrue(dados.sportId())
              .orElseThrow(
                  () ->
                      new RegraNegocioException(
                          "CATALOG_ITEM_UNAVAILABLE",
                          field + ".sportId",
                          "O esporte não está mais disponível."));
      NivelHabilidadeEntity nivel =
          nivelHabilidadeRepository
              .findByIdNivelHabilidadeAndFlAtivoTrue(dados.skillLevelId())
              .orElseThrow(
                  () ->
                      new RegraNegocioException(
                          "CATALOG_ITEM_UNAVAILABLE",
                          field + ".skillLevelId",
                          "Selecione um nível disponível."));
      jogadorEsporteRepository.save(new JogadorEsporteEntity(jogador, esporte, nivel));
    }
  }

  private LocalDate converterDataNascimento(String nascimento) {
    if (nascimento == null || nascimento.isBlank()) return null;
    try {
      LocalDate data = LocalDate.parse(nascimento);
      if (data.isAfter(LocalDate.now()))
        throw new RegraNegocioException(
            "BIRTH_DATE_INVALID",
            "user.birthDate",
            "A data de nascimento não pode estar no futuro.");
      return data;
    } catch (DateTimeParseException exception) {
      throw new RegraNegocioException(
          "BIRTH_DATE_INVALID", "user.birthDate", "Informe uma data de nascimento válida.");
    }
  }
}
