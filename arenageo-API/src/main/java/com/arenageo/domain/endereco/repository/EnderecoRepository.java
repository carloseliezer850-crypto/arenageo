package com.arenageo.domain.endereco.repository;

import com.arenageo.domain.endereco.entity.EnderecoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnderecoRepository extends JpaRepository<EnderecoEntity, Integer> {}
