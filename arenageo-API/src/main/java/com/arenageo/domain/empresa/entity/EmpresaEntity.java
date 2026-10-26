package com.arenageo.domain.empresa.entity;

import com.arenageo.domain.pessoa.entity.PessoaEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_empresa")
public class EmpresaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empresa")
    private Integer idEmpresa;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_pessoa_responsavel", nullable = false)
    private PessoaEntity pessoaResponsavel;
    @Column(name = "nm_razao_social", nullable = false, length = 180)
    private String nmRazaoSocial;
    @Column(name = "nm_nome_fantasia", nullable = false, length = 180)
    private String nmNomeFantasia;
    @Column(name = "nm_cnpj", nullable = false, unique = true, length = 14)
    private String nmCnpj;
    @Column(name = "nm_inscricao_estadual", length = 30)
    private String nmInscricaoEstadual;
    @Column(name = "nm_telefone_comercial", nullable = false, length = 20)
    private String nmTelefoneComercial;
    @Column(name = "nm_email_comercial", nullable = false, length = 254)
    private String nmEmailComercial;
    @Column(name = "fl_ativo", nullable = false)
    private Boolean flAtivo = true;

    public EmpresaEntity() {}
    public Integer getIdEmpresa() { return idEmpresa; }
    public PessoaEntity getPessoaResponsavel() { return pessoaResponsavel; }
    public void setPessoaResponsavel(PessoaEntity pessoaResponsavel) { this.pessoaResponsavel = pessoaResponsavel; }
    public String getNmRazaoSocial() { return nmRazaoSocial; }
    public void setNmRazaoSocial(String nmRazaoSocial) { this.nmRazaoSocial = nmRazaoSocial; }
    public String getNmNomeFantasia() { return nmNomeFantasia; }
    public void setNmNomeFantasia(String nmNomeFantasia) { this.nmNomeFantasia = nmNomeFantasia; }
    public String getNmCnpj() { return nmCnpj; }
    public void setNmCnpj(String nmCnpj) { this.nmCnpj = nmCnpj; }
    public String getNmInscricaoEstadual() { return nmInscricaoEstadual; }
    public void setNmInscricaoEstadual(String nmInscricaoEstadual) { this.nmInscricaoEstadual = nmInscricaoEstadual; }
    public String getNmTelefoneComercial() { return nmTelefoneComercial; }
    public void setNmTelefoneComercial(String nmTelefoneComercial) { this.nmTelefoneComercial = nmTelefoneComercial; }
    public String getNmEmailComercial() { return nmEmailComercial; }
    public void setNmEmailComercial(String nmEmailComercial) { this.nmEmailComercial = nmEmailComercial; }
    public Boolean getFlAtivo() { return flAtivo; }
    public void setFlAtivo(Boolean flAtivo) { this.flAtivo = flAtivo; }
}
