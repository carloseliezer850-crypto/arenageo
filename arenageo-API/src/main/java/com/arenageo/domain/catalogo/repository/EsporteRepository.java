package com.arenageo.domain.catalogo.repository;

import java.util.List;
import java.util.Optional;
import com.arenageo.domain.catalogo.entity.EsporteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EsporteRepository extends JpaRepository<EsporteEntity, Integer> {
    Optional<EsporteEntity> findByIdEsporteAndFlAtivoTrue(Integer idEsporte);
    List<EsporteEntity> findByFlAtivoTrueOrderByNmEsporteAsc();
}
