package com.arenageo.repository;

import com.arenageo.entity.JogadorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorRepository extends JpaRepository<JogadorEntity, Integer> {
  java.util.Optional<JogadorEntity> findByPessoa_Usuario_IdUsuario(Integer id);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query(
      "select j from JogadorEntity j where j.pessoa.usuario.idUsuario = :id")
  java.util.Optional<JogadorEntity> bloquearPorUsuario(
      @org.springframework.data.repository.query.Param("id") Integer id);
}
