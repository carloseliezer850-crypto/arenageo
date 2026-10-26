package com.arenageo.domain.catalogo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_esporte")
public class EsporteEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_esporte")
    private Integer idEsporte;
    @Column(name = "nm_esporte", nullable = false, length = 80)
    private String nmEsporte;
    @Column(name = "nm_slug", nullable = false, length = 100)
    private String nmSlug;
    @Column(name = "fl_ativo", nullable = false)
    private Boolean flAtivo;

    protected EsporteEntity() {}
    public Integer getIdEsporte() { return idEsporte; }
    public String getNmEsporte() { return nmEsporte; }
    public String getNmSlug() { return nmSlug; }
    public Boolean getFlAtivo() { return flAtivo; }
}
