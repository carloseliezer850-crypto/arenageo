package com.arenageo.domain.empresa.repository;

import com.arenageo.domain.empresa.entity.EmpresaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository extends JpaRepository<EmpresaEntity, Integer> {
    boolean existsByNmCnpj(String nmCnpj);
    boolean existsByNmEmailComercialIgnoreCase(String nmEmailComercial);
}
