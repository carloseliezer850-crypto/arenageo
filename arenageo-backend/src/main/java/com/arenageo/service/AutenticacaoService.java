package com.arenageo.service;

import java.util.Locale;
import com.arenageo.config.JwtTokenService;
import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.auth.LoginRequestDto;
import com.arenageo.exception.CredenciaisInvalidasException;
import com.arenageo.mapper.AutenticacaoMapper;
import com.arenageo.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AutenticacaoService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final AutenticacaoMapper autenticacaoMapper;

    public AutenticacaoService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                               JwtTokenService jwtTokenService, AutenticacaoMapper autenticacaoMapper) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.autenticacaoMapper = autenticacaoMapper;
    }

    @Transactional(readOnly = true)
    public AuthResponseDto<Void> entrar(LoginRequestDto request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        var usuario = usuarioRepository.findByNmEmailIgnoreCase(email)
            .filter(conta -> Boolean.TRUE.equals(conta.getFlAtivo()))
            .filter(conta -> Boolean.TRUE.equals(conta.getTipoConta().getFlAtivo()))
            .filter(conta -> passwordEncoder.matches(request.password(), conta.getNmSenhaHash()))
            .orElseThrow(CredenciaisInvalidasException::new);

        String token = jwtTokenService.gerarToken(usuario, request.rememberMe());
        return autenticacaoMapper.respostaSucesso(usuario, "Login realizado com sucesso.", null, token);
    }
}
