package com.arenageo.repository;

import com.arenageo.entity.JogadorEsporteEntity;
import com.arenageo.entity.JogadorEsporteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorEsporteRepository extends JpaRepository<JogadorEsporteEntity, JogadorEsporteId> {}
