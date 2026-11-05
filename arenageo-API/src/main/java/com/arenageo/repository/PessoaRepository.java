package com.arenageo.repository;

import com.arenageo.entity.PessoaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PessoaRepository extends JpaRepository<PessoaEntity, Integer> {
    java.util.Optional<PessoaEntity> findByUsuario_IdUsuarioAndUsuario_FlAtivoTrueAndUsuario_TipoConta_FlAtivoTrue(Integer idUsuario);
    boolean existsByNmCpf(String nmCpf);
    boolean existsByNmNomeUsuarioIgnoreCase(String nmNomeUsuario);
}
