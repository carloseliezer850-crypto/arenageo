package com.arenageo.service;

import com.arenageo.config.JwtTokenService;
import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.cadastro.CadastroEmpresaRequestDto;
import com.arenageo.dto.cadastro.CadastroEmpresaRequestDto.EmpresaDaContaDto;
import com.arenageo.dto.cadastro.CadastroResultadoDto;
import com.arenageo.entity.*;
import com.arenageo.exception.CadastroDuplicadoException;
import com.arenageo.exception.CredenciaisInvalidasException;
import com.arenageo.exception.RegraNegocioException;
import com.arenageo.mapper.AutenticacaoMapper;
import com.arenageo.mapper.CadastroMapper;
import com.arenageo.repository.*;
import com.arenageo.util.DocumentoUtils;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroEmpresaService {
  private final ContaService contaService;
  private final UsuarioRepository usuarioRepository;
  private final TipoContaRepository tipoContaRepository;
  private final PessoaRepository pessoaRepository;
  private final EmpresaRepository empresaRepository;
  private final ArenaRepository arenaRepository;
  private final EnderecoRepository enderecoRepository;
  private final PasswordEncoder passwordEncoder;
  private final CadastroMapper cadastroMapper;
  private final AutenticacaoMapper autenticacaoMapper;
  private final JwtTokenService jwtTokenService;

  public CadastroEmpresaService(
      UsuarioRepository usuarioRepository,
      TipoContaRepository tipoContaRepository,
      PessoaRepository pessoaRepository,
      EmpresaRepository empresaRepository,
      ArenaRepository arenaRepository,
      EnderecoRepository enderecoRepository,
      PasswordEncoder passwordEncoder,
      CadastroMapper cadastroMapper,
      AutenticacaoMapper autenticacaoMapper,
      JwtTokenService jwtTokenService,
      ContaService contaService) {
    this.contaService = contaService;
    this.usuarioRepository = usuarioRepository;
    this.tipoContaRepository = tipoContaRepository;
    this.pessoaRepository = pessoaRepository;
    this.empresaRepository = empresaRepository;
    this.arenaRepository = arenaRepository;
    this.enderecoRepository = enderecoRepository;
    this.passwordEncoder = passwordEncoder;
    this.cadastroMapper = cadastroMapper;
    this.autenticacaoMapper = autenticacaoMapper;
    this.jwtTokenService = jwtTokenService;
  }

  @Transactional
  public AuthResponseDto<CadastroResultadoDto> cadastrar(CadastroEmpresaRequestDto request) {
    String emailResponsavel = request.responsible().email().trim().toLowerCase(Locale.ROOT);
    String cpf = DocumentoUtils.somenteDigitos(request.responsible().cpf());
    com.arenageo.util.ValidacaoCadastro.senha(
        request.responsible().password(),
        request.responsible().email(),
        "",
        "responsible.password");
    com.arenageo.util.ValidacaoCadastro.telefone(
        request.responsible().phone(), true, "responsible.phone");

    if (!DocumentoUtils.cpfValido(request.responsible().cpf()))
      throw new RegraNegocioException("CPF_INVALID", "responsible.cpf", "Informe um CPF válido.");
    if (usuarioRepository.existsByNmEmailIgnoreCase(emailResponsavel))
      throw new CadastroDuplicadoException(
          "ACCOUNT_CONFLICT",
          "responsible.email",
          "Já existe uma conta com os dados informados. Entre ou recupere seu acesso.");
    if (pessoaRepository.existsByNmCpf(cpf))
      throw new CadastroDuplicadoException(
          "ACCOUNT_CONFLICT",
          "responsible.cpf",
          "Já existe uma conta com os dados informados. Entre ou recupere seu acesso.");
    TipoContaEntity tipoConta =
        tipoContaRepository
            .findByNmCodigoAndFlAtivoTrue("EMPRESA")
            .orElseThrow(
                () ->
                    new RegraNegocioException(
                        "Tipo de conta EMPRESA não foi configurado no banco."));

    UsuarioEntity usuario =
        cadastroMapper.criarUsuario(
            tipoConta, emailResponsavel, passwordEncoder.encode(request.responsible().password()));
    usuarioRepository.save(usuario);

    PessoaEntity pessoaResponsavel =
        cadastroMapper.criarPessoa(
            usuario,
            request.responsible().name(),
            cpf,
            null,
            request.responsible().phone(),
            null,
            null);
    pessoaRepository.save(pessoaResponsavel);

    CadastroResultadoDto resultado =
        salvarEmpresa(
            pessoaResponsavel,
            new EmpresaDaContaDto(
                request.company(), request.address(), request.arena(), request.arenaAddress()));
    contaService.emitir(usuario.getIdUsuario(), "VERIFY");
    String token = jwtTokenService.gerarToken(usuario, false);
    return autenticacaoMapper.respostaSucesso(
        usuario, "Cadastro comercial realizado com sucesso.", resultado, token);
  }

  @Transactional
  public CadastroResultadoDto cadastrarNaConta(Integer idUsuario, EmpresaDaContaDto request) {
    PessoaEntity responsavel =
        pessoaRepository
            .findByUsuario_IdUsuarioAndUsuario_FlAtivoTrueAndUsuario_TipoConta_FlAtivoTrue(
                idUsuario)
            .orElseThrow(CredenciaisInvalidasException::new);
    return salvarEmpresa(responsavel, request);
  }

  private CadastroResultadoDto salvarEmpresa(
      PessoaEntity pessoaResponsavel, EmpresaDaContaDto request) {
    String cnpj = DocumentoUtils.normalizarCnpj(request.company().cnpj());
    String emailComercial = request.company().businessEmail().trim().toLowerCase(Locale.ROOT);
    if (!DocumentoUtils.cnpjValido(request.company().cnpj()))
      throw new RegraNegocioException("CNPJ_INVALID", "company.cnpj", "Informe um CNPJ válido.");
    if (empresaRepository.existsByNmCnpj(cnpj))
      throw new CadastroDuplicadoException(
          "CNPJ_IN_USE",
          "company.cnpj",
          "Esta empresa já está cadastrada. Entre para gerenciar suas arenas.");
    if (empresaRepository.existsByNmEmailComercialIgnoreCase(emailComercial))
      throw new CadastroDuplicadoException(
          "BUSINESS_EMAIL_IN_USE",
          "company.businessEmail",
          "Este e-mail comercial já está cadastrado.");

    com.arenageo.util.ValidacaoCadastro.telefone(
        request.company().businessPhone(), true, "company.businessPhone");
    com.arenageo.util.ValidacaoCadastro.telefone(request.arena().phone(), true, "arena.phone");
    com.arenageo.util.ValidacaoCadastro.website(request.arena().website(), "arena.website");
    EmpresaEntity empresa = cadastroMapper.criarEmpresa(pessoaResponsavel, request.company(), cnpj);
    empresaRepository.save(empresa);
    enderecoRepository.save(
        cadastroMapper.criarEnderecoEmpresa(empresa, request.address(), "COMERCIAL"));

    ArenaEntity arena = cadastroMapper.criarArena(empresa, request.arena());
    arenaRepository.save(arena);
    enderecoRepository.save(
        cadastroMapper.criarEnderecoArena(
            arena,
            request.arenaAddress() == null ? request.address() : request.arenaAddress(),
            "ARENA"));

    enderecoRepository.flush();
    return new CadastroResultadoDto(empresa.getIdEmpresa(), "EMPRESA");
  }
}
