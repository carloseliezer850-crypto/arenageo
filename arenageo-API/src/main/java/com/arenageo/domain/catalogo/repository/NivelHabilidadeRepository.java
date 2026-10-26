package com.arenageo.domain.catalogo.repository;

import java.util.List;
import java.util.Optional;
import com.arenageo.domain.catalogo.entity.NivelHabilidadeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NivelHabilidadeRepository extends JpaRepository<NivelHabilidadeEntity, Integer> {
    Optional<NivelHabilidadeEntity> findByIdNivelHabilidadeAndFlAtivoTrue(Integer idNivelHabilidade);
    List<NivelHabilidadeEntity> findByFlAtivoTrueOrderByNmNivelHabilidadeAsc();
}
