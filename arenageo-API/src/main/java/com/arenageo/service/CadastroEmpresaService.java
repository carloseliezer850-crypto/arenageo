package com.arenageo.service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import com.arenageo.config.JwtTokenService;
import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.cadastro.CadastroEmpresaRequestDto;
import com.arenageo.dto.cadastro.CadastroEmpresaRequestDto.EmpresaDaContaDto;
import com.arenageo.exception.CredenciaisInvalidasException;
import com.arenageo.dto.cadastro.CadastroResultadoDto;
import com.arenageo.entity.*;
import com.arenageo.exception.CadastroDuplicadoException;
import com.arenageo.exception.RegraNegocioException;
import com.arenageo.mapper.AutenticacaoMapper;
import com.arenageo.mapper.CadastroMapper;
import com.arenageo.repository.*;
import com.arenageo.util.DocumentoUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroEmpresaService {
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
            UsuarioRepository usuarioRepository, TipoContaRepository tipoContaRepository,
            PessoaRepository pessoaRepository, EmpresaRepository empresaRepository,
            ArenaRepository arenaRepository, EnderecoRepository enderecoRepository,
            PasswordEncoder passwordEncoder, CadastroMapper cadastroMapper,
            AutenticacaoMapper autenticacaoMapper, JwtTokenService jwtTokenService) {
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
        validarSenha(request.responsible().password());

        if (!DocumentoUtils.cpfValido(cpf)) throw new RegraNegocioException("CPF do responsável informado é inválido.");
        if (usuarioRepository.existsByNmEmailIgnoreCase(emailResponsavel))
            throw new CadastroDuplicadoException("Este e-mail do responsável já está cadastrado.");
        if (pessoaRepository.existsByNmCpf(cpf))
            throw new CadastroDuplicadoException("Este CPF já está cadastrado.");
        TipoContaEntity tipoConta = tipoContaRepository.findByNmCodigoAndFlAtivoTrue("EMPRESA")
            .orElseThrow(() -> new RegraNegocioException("Tipo de conta EMPRESA não foi configurado no banco."));

        UsuarioEntity usuario = cadastroMapper.criarUsuario(tipoConta, emailResponsavel,
            passwordEncoder.encode(request.responsible().password()));
        usuarioRepository.save(usuario);

        PessoaEntity pessoaResponsavel = cadastroMapper.criarPessoa(usuario, request.responsible().name(),
            cpf, null, request.responsible().phone(), null, null);
        pessoaRepository.save(pessoaResponsavel);

        CadastroResultadoDto resultado = salvarEmpresa(pessoaResponsavel,
            new EmpresaDaContaDto(request.company(), request.address(), request.arena()));
        String token = jwtTokenService.gerarToken(usuario, false);
        return autenticacaoMapper.respostaSucesso(usuario,
            "Cadastro comercial realizado com sucesso.", resultado, token);
    }

    @Transactional
    public CadastroResultadoDto cadastrarNaConta(Integer idUsuario, EmpresaDaContaDto request) {
        PessoaEntity responsavel = pessoaRepository
            .findByUsuario_IdUsuarioAndUsuario_FlAtivoTrueAndUsuario_TipoConta_FlAtivoTrue(idUsuario)
            .orElseThrow(CredenciaisInvalidasException::new);
        return salvarEmpresa(responsavel, request);
    }

    private CadastroResultadoDto salvarEmpresa(PessoaEntity pessoaResponsavel, EmpresaDaContaDto request) {
        String cnpj = DocumentoUtils.somenteDigitos(request.company().cnpj());
        String emailComercial = request.company().businessEmail().trim().toLowerCase(Locale.ROOT);
        if (!DocumentoUtils.cnpjValido(cnpj)) throw new RegraNegocioException("CNPJ informado é inválido.");
        if (empresaRepository.existsByNmCnpj(cnpj))
            throw new CadastroDuplicadoException("Este CNPJ já está cadastrado.");
        if (empresaRepository.existsByNmEmailComercialIgnoreCase(emailComercial))
            throw new CadastroDuplicadoException("Este e-mail comercial já está cadastrado.");

        EmpresaEntity empresa = cadastroMapper.criarEmpresa(pessoaResponsavel, request.company(), cnpj);
        empresaRepository.save(empresa);
        enderecoRepository.save(cadastroMapper.criarEnderecoEmpresa(empresa, request.address(), "COMERCIAL"));

        ArenaEntity arena = cadastroMapper.criarArena(empresa, request.arena());
        arenaRepository.save(arena);
        enderecoRepository.save(cadastroMapper.criarEnderecoArena(arena, request.address(), "ARENA"));

        return new CadastroResultadoDto(empresa.getIdEmpresa(), "EMPRESA");
    }

    private void validarSenha(String senha) {
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new RegraNegocioException("A senha deve ter no máximo 72 bytes em UTF-8 para o algoritmo BCrypt.");
    }
}
