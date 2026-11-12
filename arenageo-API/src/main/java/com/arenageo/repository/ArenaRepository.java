package com.arenageo.repository;

import com.arenageo.dto.catalogo.ArenaResumoDto;
import com.arenageo.entity.ArenaEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArenaRepository extends JpaRepository<ArenaEntity, Integer> {
  @Query(
      """
      select new com.arenageo.dto.catalogo.ArenaResumoDto(a.idArena, a.nmNome, a.dsDescricao,
          e.nmCidade, e.nmUf, e.nmLogradouro, e.nmNumero, a.dsHorarioFuncionamento)
      from EnderecoEntity e join e.arena a
      where e.flPrincipal = true and a.flAtivo = true and a.empresa.flAtivo = true
        and a.statusPublicacao = 'PUBLICADO'
        and lower(e.nmCidade) = lower(:cidade) and (:uf is null or e.nmUf = :uf)
      order by a.nmNome, a.idArena
      """)
  List<ArenaResumoDto> buscarPorCidade(@Param("cidade") String cidade, @Param("uf") String uf);
}
