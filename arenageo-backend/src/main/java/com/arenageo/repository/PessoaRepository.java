package com.arenageo.repository;

import com.arenageo.entity.PessoaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PessoaRepository extends JpaRepository<PessoaEntity, Integer> {
    boolean existsByNmCpf(String nmCpf);
    boolean existsByNmNomeUsuarioIgnoreCase(String nmNomeUsuario);
}
