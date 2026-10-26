package com.arenageo.domain.arena.entity;

import com.arenageo.domain.empresa.entity.EmpresaEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_arena")
public class ArenaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_arena")
    private Integer idArena;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_empresa", nullable = false)
    private EmpresaEntity empresa;
    @Column(name = "nm_nome", nullable = false, length = 160)
    private String nmNome;
    @Column(name = "ds_descricao", nullable = false, columnDefinition = "text")
    private String dsDescricao = "";
    @Column(name = "nm_url_imagem", length = 500)
    private String nmUrlImagem;
    @Column(name = "nm_telefone", nullable = false, length = 20)
    private String nmTelefone;
    @Column(name = "nm_email", nullable = false, length = 254)
    private String nmEmail;
    @Column(name = "nm_website", length = 500)
    private String nmWebsite;
    @Column(name = "nm_instagram", length = 120)
    private String nmInstagram;
    @Column(name = "ds_horario_funcionamento", nullable = false, columnDefinition = "text")
    private String dsHorarioFuncionamento = "";
    @Column(name = "fl_ativo", nullable = false)
    private Boolean flAtivo = true;

    public ArenaEntity() {}
    public Integer getIdArena() { return idArena; }
    public EmpresaEntity getEmpresa() { return empresa; }
    public void setEmpresa(EmpresaEntity empresa) { this.empresa = empresa; }
    public String getNmNome() { return nmNome; }
    public void setNmNome(String nmNome) { this.nmNome = nmNome; }
    public String getDsDescricao() { return dsDescricao; }
    public void setDsDescricao(String dsDescricao) { this.dsDescricao = dsDescricao; }
    public String getNmUrlImagem() { return nmUrlImagem; }
    public void setNmUrlImagem(String nmUrlImagem) { this.nmUrlImagem = nmUrlImagem; }
    public String getNmTelefone() { return nmTelefone; }
    public void setNmTelefone(String nmTelefone) { this.nmTelefone = nmTelefone; }
    public String getNmEmail() { return nmEmail; }
    public void setNmEmail(String nmEmail) { this.nmEmail = nmEmail; }
    public String getNmWebsite() { return nmWebsite; }
    public void setNmWebsite(String nmWebsite) { this.nmWebsite = nmWebsite; }
    public String getNmInstagram() { return nmInstagram; }
    public void setNmInstagram(String nmInstagram) { this.nmInstagram = nmInstagram; }
    public String getDsHorarioFuncionamento() { return dsHorarioFuncionamento; }
    public void setDsHorarioFuncionamento(String dsHorarioFuncionamento) { this.dsHorarioFuncionamento = dsHorarioFuncionamento; }
    public Boolean getFlAtivo() { return flAtivo; }
    public void setFlAtivo(Boolean flAtivo) { this.flAtivo = flAtivo; }
}
