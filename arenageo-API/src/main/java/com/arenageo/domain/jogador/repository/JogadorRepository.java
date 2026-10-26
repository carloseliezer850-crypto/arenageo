package com.arenageo.domain.jogador.repository;

import com.arenageo.domain.jogador.entity.JogadorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorRepository extends JpaRepository<JogadorEntity, Integer> {}
