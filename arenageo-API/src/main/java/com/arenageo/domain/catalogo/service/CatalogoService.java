package com.arenageo.domain.catalogo.service;

import java.util.List;
import com.arenageo.api.catalogo.dto.EsporteResponseDto;
import com.arenageo.api.catalogo.dto.NivelHabilidadeResponseDto;
import com.arenageo.domain.catalogo.repository.EsporteRepository;
import com.arenageo.domain.catalogo.repository.NivelHabilidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogoService {
    private final EsporteRepository esporteRepository;
    private final NivelHabilidadeRepository nivelHabilidadeRepository;

    public CatalogoService(EsporteRepository esporteRepository, NivelHabilidadeRepository nivelHabilidadeRepository) {
        this.esporteRepository = esporteRepository;
        this.nivelHabilidadeRepository = nivelHabilidadeRepository;
    }

    @Transactional(readOnly = true)
    public List<EsporteResponseDto> listarEsportes() {
        return esporteRepository.findByFlAtivoTrueOrderByNmEsporteAsc().stream()
            .map(e -> new EsporteResponseDto(e.getIdEsporte(), e.getNmEsporte(), e.getNmSlug(),
                Boolean.TRUE.equals(e.getFlAtivo())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<NivelHabilidadeResponseDto> listarNiveis() {
        return nivelHabilidadeRepository.findByFlAtivoTrueOrderByNmNivelHabilidadeAsc().stream()
            .map(n -> new NivelHabilidadeResponseDto(n.getIdNivelHabilidade(), n.getNmNivelHabilidade(),
                n.getDsDescricao(), Boolean.TRUE.equals(n.getFlAtivo())))
            .toList();
    }
}
