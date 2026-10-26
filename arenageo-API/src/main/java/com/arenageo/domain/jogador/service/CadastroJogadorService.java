package com.arenageo.domain.jogador.service;

import com.arenageo.domain.catalogo.entity.EsporteEntity;
import com.arenageo.domain.jogador.entity.JogadorEntity;
import com.arenageo.domain.jogador.entity.JogadorEsporteEntity;
import com.arenageo.domain.catalogo.entity.NivelHabilidadeEntity;
import com.arenageo.domain.pessoa.entity.PessoaEntity;
import com.arenageo.domain.usuario.entity.TipoContaEntity;
import com.arenageo.domain.usuario.entity.UsuarioEntity;
import com.arenageo.domain.endereco.repository.EnderecoRepository;
import com.arenageo.domain.catalogo.repository.EsporteRepository;
import com.arenageo.domain.jogador.repository.JogadorEsporteRepository;
import com.arenageo.domain.jogador.repository.JogadorRepository;
import com.arenageo.domain.catalogo.repository.NivelHabilidadeRepository;
import com.arenageo.domain.pessoa.repository.PessoaRepository;
import com.arenageo.domain.usuario.repository.TipoContaRepository;
import com.arenageo.domain.usuario.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import com.arenageo.config.JwtTokenService;
import com.arenageo.api.autenticacao.dto.AuthResponseDto;
import com.arenageo.api.jogador.dto.CadastroJogadorRequestDto;
import com.arenageo.api.cadastro.dto.CadastroResultadoDto;
import com.arenageo.entity.*;
import com.arenageo.exception.CadastroDuplicadoException;
import com.arenageo.exception.RegraNegocioException;
import com.arenageo.api.autenticacao.mapper.AutenticacaoMapper;
import com.arenageo.api.cadastro.mapper.CadastroMapper;
import com.arenageo.repository.*;
import com.arenageo.util.DocumentoUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroJogadorService {
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
            UsuarioRepository usuarioRepository, TipoContaRepository tipoContaRepository,
            PessoaRepository pessoaRepository, JogadorRepository jogadorRepository,
            EnderecoRepository enderecoRepository, EsporteRepository esporteRepository,
            NivelHabilidadeRepository nivelHabilidadeRepository, JogadorEsporteRepository jogadorEsporteRepository,
            PasswordEncoder passwordEncoder, CadastroMapper cadastroMapper,
            AutenticacaoMapper autenticacaoMapper, JwtTokenService jwtTokenService) {
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
        validarSenha(request.user().password());

        if (!DocumentoUtils.cpfValido(cpf)) throw new RegraNegocioException("CPF informado é inválido.");
        if (usuarioRepository.existsByNmEmailIgnoreCase(email))
            throw new CadastroDuplicadoException("Este e-mail já está cadastrado.");
        if (pessoaRepository.existsByNmCpf(cpf))
            throw new CadastroDuplicadoException("Este CPF já está cadastrado.");
        if (pessoaRepository.existsByNmNomeUsuarioIgnoreCase(nomeUsuario))
            throw new CadastroDuplicadoException("Este nome de usuário já está em uso.");

        TipoContaEntity tipoConta = tipoContaRepository.findByNmCodigoAndFlAtivoTrue("JOGADOR")
            .orElseThrow(() -> new RegraNegocioException("Tipo de conta JOGADOR não foi configurado no banco."));

        UsuarioEntity usuario = cadastroMapper.criarUsuario(tipoConta, email,
            passwordEncoder.encode(request.user().password()));
        usuarioRepository.save(usuario);

        PessoaEntity pessoa = cadastroMapper.criarPessoa(usuario, request.user().name(), cpf,
            converterDataNascimento(request.user().birthDate()), request.user().phone(),
            nomeUsuario, request.user().profileImageUrl());
        pessoaRepository.save(pessoa);

        JogadorEntity jogador = cadastroMapper.criarJogador(pessoa);
        jogadorRepository.save(jogador);
        enderecoRepository.save(cadastroMapper.criarEnderecoPessoa(pessoa, request.address(), "RESIDENCIAL"));

        salvarEsportes(request, jogador);

        String token = jwtTokenService.gerarToken(usuario, false);
        CadastroResultadoDto resultado = new CadastroResultadoDto(jogador.getIdJogador(), "JOGADOR");
        return autenticacaoMapper.respostaSucesso(usuario,
            "Cadastro de jogador realizado com sucesso.", resultado, token);
    }

    private void salvarEsportes(CadastroJogadorRequestDto request, JogadorEntity jogador) {
        if (request.sports() == null || request.sports().isEmpty()) return;
        Set<Integer> esportesInformados = new HashSet<>();
        for (CadastroJogadorRequestDto.EsporteJogadorDto dados : request.sports()) {
            if (!esportesInformados.add(dados.sportId()))
                throw new RegraNegocioException("Não é permitido informar o mesmo esporte mais de uma vez.");
            EsporteEntity esporte = esporteRepository.findByIdEsporteAndFlAtivoTrue(dados.sportId())
                .orElseThrow(() -> new RegraNegocioException("O esporte informado não existe ou está inativo."));
            NivelHabilidadeEntity nivel = nivelHabilidadeRepository.findByIdNivelHabilidadeAndFlAtivoTrue(dados.skillLevelId())
                .orElseThrow(() -> new RegraNegocioException("O nível de habilidade informado não existe ou está inativo."));
            jogadorEsporteRepository.save(new JogadorEsporteEntity(jogador, esporte, nivel));
        }
    }

    private LocalDate converterDataNascimento(String nascimento) {
        if (nascimento == null || nascimento.isBlank()) return null;
        try {
            return LocalDate.parse(nascimento);
        } catch (DateTimeParseException exception) {
            throw new RegraNegocioException("Data de nascimento inválida.");
        }
    }

    private void validarSenha(String senha) {
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new RegraNegocioException("A senha deve ter no máximo 72 bytes em UTF-8 para o algoritmo BCrypt.");
    }
}
