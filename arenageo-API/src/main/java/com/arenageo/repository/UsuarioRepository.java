package com.arenageo.repository;

import java.util.Optional;
import com.arenageo.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Integer> {
    Optional<UsuarioEntity> findByNmEmailIgnoreCase(String nmEmail);
    boolean existsByNmEmailIgnoreCase(String nmEmail);
}
