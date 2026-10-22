package com.arenageo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_usuario")
public class UsuarioEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_conta", nullable = false)
    private TipoContaEntity tipoConta;
    @Column(name = "nm_email", nullable = false, length = 254)
    private String nmEmail;
    @Column(name = "nm_senha_hash", nullable = false, length = 255)
    private String nmSenhaHash;
    @Column(name = "fl_ativo", nullable = false)
    private Boolean flAtivo = true;

    public UsuarioEntity() {}
    public Integer getIdUsuario() { return idUsuario; }
    public TipoContaEntity getTipoConta() { return tipoConta; }
    public void setTipoConta(TipoContaEntity tipoConta) { this.tipoConta = tipoConta; }
    public String getNmEmail() { return nmEmail; }
    public void setNmEmail(String nmEmail) { this.nmEmail = nmEmail; }
    public String getNmSenhaHash() { return nmSenhaHash; }
    public void setNmSenhaHash(String nmSenhaHash) { this.nmSenhaHash = nmSenhaHash; }
    public Boolean getFlAtivo() { return flAtivo; }
    public void setFlAtivo(Boolean flAtivo) { this.flAtivo = flAtivo; }
}
