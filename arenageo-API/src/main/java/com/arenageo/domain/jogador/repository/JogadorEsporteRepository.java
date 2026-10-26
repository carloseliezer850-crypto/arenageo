package com.arenageo.domain.jogador.repository;

import com.arenageo.domain.jogador.entity.JogadorEsporteEntity;
import com.arenageo.domain.jogador.entity.JogadorEsporteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorEsporteRepository extends JpaRepository<JogadorEsporteEntity, JogadorEsporteId> {}
