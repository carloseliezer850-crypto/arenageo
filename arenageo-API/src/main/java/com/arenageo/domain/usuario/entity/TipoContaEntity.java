package com.arenageo.domain.usuario.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_tipo_conta")
public class TipoContaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_conta")
    private Integer idTipoConta;
    @Column(name = "nm_codigo", nullable = false, length = 30)
    private String nmCodigo;
    @Column(name = "nm_tipo_conta", nullable = false, length = 60)
    private String nmTipoConta;
    @Column(name = "fl_ativo", nullable = false)
    private Boolean flAtivo;

    protected TipoContaEntity() {}
    public Integer getIdTipoConta() { return idTipoConta; }
    public String getNmCodigo() { return nmCodigo; }
    public String getNmTipoConta() { return nmTipoConta; }
    public Boolean getFlAtivo() { return flAtivo; }
}
