package com.arenageo.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_endereco")
public class EnderecoEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_endereco")
    private Integer idEndereco;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_pessoa")
    private PessoaEntity pessoa;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_empresa")
    private EmpresaEntity empresa;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_arena")
    private ArenaEntity arena;
    @Column(name = "nm_tipo_endereco", nullable = false, length = 20)
    private String nmTipoEndereco;
    @Column(name = "nm_cep", length = 8)
    private String nmCep;
    @Column(name = "nm_uf", columnDefinition = "char(2)", length = 2)
    private String nmUf;
    @Column(name = "nm_cidade", nullable = false, length = 120)
    private String nmCidade;
    @Column(name = "nm_bairro", length = 120)
    private String nmBairro;
    @Column(name = "nm_logradouro", length = 160)
    private String nmLogradouro;
    @Column(name = "nm_numero", length = 20)
    private String nmNumero;
    @Column(name = "nm_complemento", length = 120)
    private String nmComplemento;
    @Column(name = "nr_latitude", precision = 9, scale = 6)
    private BigDecimal nrLatitude;
    @Column(name = "nr_longitude", precision = 9, scale = 6)
    private BigDecimal nrLongitude;
    @Column(name = "fl_principal", nullable = false)
    private Boolean flPrincipal = false;

    public EnderecoEntity() {}
    public Integer getIdEndereco() { return idEndereco; }
    public PessoaEntity getPessoa() { return pessoa; }
    public void setPessoa(PessoaEntity pessoa) { this.pessoa = pessoa; }
    public EmpresaEntity getEmpresa() { return empresa; }
    public void setEmpresa(EmpresaEntity empresa) { this.empresa = empresa; }
    public ArenaEntity getArena() { return arena; }
    public void setArena(ArenaEntity arena) { this.arena = arena; }
    public String getNmTipoEndereco() { return nmTipoEndereco; }
    public void setNmTipoEndereco(String nmTipoEndereco) { this.nmTipoEndereco = nmTipoEndereco; }
    public String getNmCep() { return nmCep; }
    public void setNmCep(String nmCep) { this.nmCep = nmCep; }
    public String getNmUf() { return nmUf; }
    public void setNmUf(String nmUf) { this.nmUf = nmUf; }
    public String getNmCidade() { return nmCidade; }
    public void setNmCidade(String nmCidade) { this.nmCidade = nmCidade; }
    public String getNmBairro() { return nmBairro; }
    public void setNmBairro(String nmBairro) { this.nmBairro = nmBairro; }
    public String getNmLogradouro() { return nmLogradouro; }
    public void setNmLogradouro(String nmLogradouro) { this.nmLogradouro = nmLogradouro; }
    public String getNmNumero() { return nmNumero; }
    public void setNmNumero(String nmNumero) { this.nmNumero = nmNumero; }
    public String getNmComplemento() { return nmComplemento; }
    public void setNmComplemento(String nmComplemento) { this.nmComplemento = nmComplemento; }
    public BigDecimal getNrLatitude() { return nrLatitude; }
    public void setNrLatitude(BigDecimal nrLatitude) { this.nrLatitude = nrLatitude; }
    public BigDecimal getNrLongitude() { return nrLongitude; }
    public void setNrLongitude(BigDecimal nrLongitude) { this.nrLongitude = nrLongitude; }
    public Boolean getFlPrincipal() { return flPrincipal; }
    public void setFlPrincipal(Boolean flPrincipal) { this.flPrincipal = flPrincipal; }
}
