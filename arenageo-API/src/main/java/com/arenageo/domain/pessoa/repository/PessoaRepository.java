package com.arenageo.domain.pessoa.repository;

import com.arenageo.domain.pessoa.entity.PessoaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PessoaRepository extends JpaRepository<PessoaEntity, Integer> {
    boolean existsByNmCpf(String nmCpf);
    boolean existsByNmNomeUsuarioIgnoreCase(String nmNomeUsuario);
}
