package com.arenageo.domain.jogador.entity;

import com.arenageo.domain.catalogo.entity.EsporteEntity;
import com.arenageo.domain.catalogo.entity.NivelHabilidadeEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_jogador_esporte")
public class JogadorEsporteEntity {
    @EmbeddedId
    private JogadorEsporteId id;
    @MapsId("idJogador")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_jogador", nullable = false)
    private JogadorEntity jogador;
    @MapsId("idEsporte")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_esporte", nullable = false)
    private EsporteEntity esporte;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nivel_habilidade")
    private NivelHabilidadeEntity nivelHabilidade;

    protected JogadorEsporteEntity() {}
    public JogadorEsporteEntity(JogadorEntity jogador, EsporteEntity esporte, NivelHabilidadeEntity nivelHabilidade) {
        this.jogador = jogador;
        this.esporte = esporte;
        this.nivelHabilidade = nivelHabilidade;
        this.id = new JogadorEsporteId(jogador.getIdJogador(), esporte.getIdEsporte());
    }
    public JogadorEsporteId getId() { return id; }
    public JogadorEntity getJogador() { return jogador; }
    public EsporteEntity getEsporte() { return esporte; }
    public NivelHabilidadeEntity getNivelHabilidade() { return nivelHabilidade; }
}
