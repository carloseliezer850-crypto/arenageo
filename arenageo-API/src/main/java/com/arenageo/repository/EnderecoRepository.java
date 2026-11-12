package com.arenageo.repository;

import com.arenageo.entity.EnderecoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnderecoRepository extends JpaRepository<EnderecoEntity, Integer> {
  java.util.Optional<EnderecoEntity> findByPessoa_IdPessoaAndFlPrincipalTrue(Integer id);

  java.util.Optional<EnderecoEntity> findByArena_IdArenaAndFlPrincipalTrue(Integer id);

  java.util.Optional<EnderecoEntity> findByEmpresa_IdEmpresaAndFlPrincipalTrue(Integer id);
}
