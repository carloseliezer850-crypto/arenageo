package com.arenageo.config;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import com.arenageo.domain.usuario.entity.UsuarioEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private final SecretKey signingKey;
    private final long expirationMinutes;

    public JwtTokenService(
            @Value("${security.jwt.secret-base64}") String secretBase64,
            @Value("${security.jwt.expiration-minutes:60}") long expirationMinutes) {
        if (secretBase64 == null || secretBase64.isBlank()) {
            throw new IllegalStateException(
                "JWT_SECRET_BASE64 não configurado. Gere uma chave base64 de pelo menos 32 bytes.");
        }
        try {
            this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretBase64.trim()));
        } catch (RuntimeException exception) {
            throw new IllegalStateException("JWT_SECRET_BASE64 inválido; informe uma chave base64 segura.", exception);
        }
        this.expirationMinutes = expirationMinutes;
    }

    public String gerarToken(UsuarioEntity usuario, boolean lembrarSessao) {
        Instant agora = Instant.now();
        Duration validade = lembrarSessao ? Duration.ofDays(7) : Duration.ofMinutes(expirationMinutes);
        return Jwts.builder()
            .subject(String.valueOf(usuario.getIdUsuario()))
            .claim("email", usuario.getNmEmail())
            .claim("accountType", usuario.getTipoConta().getNmCodigo())
            .claim("accountTypeId", usuario.getTipoConta().getIdTipoConta())
            .issuedAt(Date.from(agora))
            .expiration(Date.from(agora.plus(validade)))
            .signWith(signingKey)
            .compact();
    }

    public Claims validarToken(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }
}
