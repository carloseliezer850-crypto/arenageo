package com.arenageo.mapper;

import com.arenageo.dto.auth.AuthResponseDto;
import com.arenageo.dto.auth.UsuarioAutenticadoDto;
import com.arenageo.entity.UsuarioEntity;
import org.springframework.stereotype.Component;

@Component
public class AutenticacaoMapper {
    public <T> AuthResponseDto<T> respostaSucesso(UsuarioEntity usuario, String mensagem, T dados, String token) {
        UsuarioAutenticadoDto usuarioDto = new UsuarioAutenticadoDto(
            usuario.getIdUsuario(), usuario.getNmEmail(), usuario.getTipoConta().getIdTipoConta());
        return new AuthResponseDto<>(true, mensagem, usuarioDto, dados, token);
    }
}
