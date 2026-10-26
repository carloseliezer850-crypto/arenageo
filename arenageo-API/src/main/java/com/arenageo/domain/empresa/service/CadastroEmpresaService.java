package com.arenageo.domain.empresa.service;

import com.arenageo.domain.arena.entity.ArenaEntity;
import com.arenageo.domain.empresa.entity.EmpresaEntity;
import com.arenageo.domain.pessoa.entity.PessoaEntity;
import com.arenageo.domain.usuario.entity.TipoContaEntity;
import com.arenageo.domain.usuario.entity.UsuarioEntity;
import com.arenageo.domain.arena.repository.ArenaRepository;
import com.arenageo.domain.empresa.repository.EmpresaRepository;
import com.arenageo.domain.endereco.repository.EnderecoRepository;
import com.arenageo.domain.pessoa.repository.PessoaRepository;
import com.arenageo.domain.usuario.repository.TipoContaRepository;
import com.arenageo.domain.usuario.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

import com.arenageo.config.JwtTokenService;
import com.arenageo.api.autenticacao.dto.AuthResponseDto;
import com.arenageo.api.empresa.dto.CadastroEmpresaRequestDto;
import com.arenageo.api.cadastro.dto.CadastroResultadoDto;
import com.arenageo.exception.CadastroDuplicadoException;
import com.arenageo.exception.RegraNegocioException;
import com.arenageo.api.autenticacao.mapper.AutenticacaoMapper;
import com.arenageo.api.cadastro.mapper.CadastroMapper;
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
        String cnpj = DocumentoUtils.somenteDigitos(request.company().cnpj());
        String emailComercial = request.company().businessEmail().trim().toLowerCase(Locale.ROOT);
        validarSenha(request.responsible().password());

        if (!DocumentoUtils.cpfValido(cpf)) throw new RegraNegocioException("CPF do responsável informado é inválido.");
        if (!DocumentoUtils.cnpjValido(cnpj)) throw new RegraNegocioException("CNPJ informado é inválido.");
        if (usuarioRepository.existsByNmEmailIgnoreCase(emailResponsavel))
            throw new CadastroDuplicadoException("Este e-mail do responsável já está cadastrado.");
        if (pessoaRepository.existsByNmCpf(cpf))
            throw new CadastroDuplicadoException("Este CPF já está cadastrado.");
        if (empresaRepository.existsByNmCnpj(cnpj))
            throw new CadastroDuplicadoException("Este CNPJ já está cadastrado.");
        if (empresaRepository.existsByNmEmailComercialIgnoreCase(emailComercial))
            throw new CadastroDuplicadoException("Este e-mail comercial já está cadastrado.");

        TipoContaEntity tipoConta = tipoContaRepository.findByNmCodigoAndFlAtivoTrue("EMPRESA")
            .orElseThrow(() -> new RegraNegocioException("Tipo de conta EMPRESA não foi configurado no banco."));

        UsuarioEntity usuario = cadastroMapper.criarUsuario(tipoConta, emailResponsavel,
            passwordEncoder.encode(request.responsible().password()));
        usuarioRepository.save(usuario);

        PessoaEntity pessoaResponsavel = cadastroMapper.criarPessoa(usuario, request.responsible().name(),
            cpf, null, request.responsible().phone(), null, null);
        pessoaRepository.save(pessoaResponsavel);

        EmpresaEntity empresa = cadastroMapper.criarEmpresa(pessoaResponsavel, request.company(), cnpj);
        empresaRepository.save(empresa);
        enderecoRepository.save(cadastroMapper.criarEnderecoEmpresa(empresa, request.address(), "COMERCIAL"));

        ArenaEntity arena = cadastroMapper.criarArena(empresa, request.arena());
        arenaRepository.save(arena);
        enderecoRepository.save(cadastroMapper.criarEnderecoArena(arena, request.address(), "ARENA"));

        String token = jwtTokenService.gerarToken(usuario, false);
        CadastroResultadoDto resultado = new CadastroResultadoDto(empresa.getIdEmpresa(), "EMPRESA");
        return autenticacaoMapper.respostaSucesso(usuario,
            "Cadastro comercial realizado com sucesso.", resultado, token);
    }

    private void validarSenha(String senha) {
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new RegraNegocioException("A senha deve ter no máximo 72 bytes em UTF-8 para o algoritmo BCrypt.");
    }
}
