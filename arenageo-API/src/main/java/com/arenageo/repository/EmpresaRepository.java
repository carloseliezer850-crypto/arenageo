package com.arenageo.repository;

import com.arenageo.entity.EmpresaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository extends JpaRepository<EmpresaEntity, Integer> {
  java.util.List<EmpresaEntity> findByPessoaResponsavel_Usuario_IdUsuarioAndFlAtivoTrue(Integer id);

  boolean existsByNmCnpj(String nmCnpj);

  boolean existsByNmEmailComercialIgnoreCase(String nmEmailComercial);
}
