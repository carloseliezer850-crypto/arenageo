package com.arenageo.api.autenticacao.mapper;

import com.arenageo.api.autenticacao.dto.AuthResponseDto;
import com.arenageo.api.autenticacao.dto.UsuarioAutenticadoDto;
import com.arenageo.domain.usuario.entity.UsuarioEntity;
import org.springframework.stereotype.Component;

@Component
public class AutenticacaoMapper {
    public <T> AuthResponseDto<T> respostaSucesso(UsuarioEntity usuario, String mensagem, T dados, String token) {
        UsuarioAutenticadoDto usuarioDto = new UsuarioAutenticadoDto(
            usuario.getIdUsuario(), usuario.getNmEmail(), usuario.getTipoConta().getIdTipoConta());
        return new AuthResponseDto<>(true, mensagem, usuarioDto, dados, token);
    }
}
