package com.arenageo.domain.usuario.repository;

import java.util.Optional;
import com.arenageo.domain.usuario.entity.TipoContaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoContaRepository extends JpaRepository<TipoContaEntity, Integer> {
    Optional<TipoContaEntity> findByNmCodigoAndFlAtivoTrue(String nmCodigo);
}
