package com.arenageo.repository;

import java.util.Optional;
import com.arenageo.entity.TipoContaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoContaRepository extends JpaRepository<TipoContaEntity, Integer> {
    Optional<TipoContaEntity> findByNmCodigoAndFlAtivoTrue(String nmCodigo);
}
