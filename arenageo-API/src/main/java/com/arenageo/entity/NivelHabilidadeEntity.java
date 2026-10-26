package com.arenageo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_nivel_habilidade")
public class NivelHabilidadeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nivel_habilidade")
    private Integer idNivelHabilidade;
    @Column(name = "nm_nivel_habilidade", nullable = false, length = 80)
    private String nmNivelHabilidade;
    @Column(name = "ds_descricao", nullable = false, columnDefinition = "text")
    private String dsDescricao = "";
    @Column(name = "fl_ativo", nullable = false)
    private Boolean flAtivo;

    protected NivelHabilidadeEntity() {}
    public Integer getIdNivelHabilidade() { return idNivelHabilidade; }
    public String getNmNivelHabilidade() { return nmNivelHabilidade; }
    public String getDsDescricao() { return dsDescricao; }
    public Boolean getFlAtivo() { return flAtivo; }
}
