package com.arenageo.entity;

import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_pessoa")
public class PessoaEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pessoa")
    private Integer idPessoa;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private UsuarioEntity usuario;
    @Column(name = "nm_completo", nullable = false, length = 160)
    private String nmCompleto;
    @Column(name = "nm_cpf", nullable = false, unique = true, length = 11)
    private String nmCpf;
    @Column(name = "nm_nome_usuario", length = 30)
    private String nmNomeUsuario;
    @Column(name = "dt_nascimento")
    private LocalDate dtNascimento;
    @Column(name = "nm_nacionalidade", nullable = false, length = 80)
    private String nmNacionalidade = "Brasileira";
    @Column(name = "nm_genero", columnDefinition = "char(1)", length = 1)
    private String nmGenero;
    @Column(name = "nm_telefone", length = 20)
    private String nmTelefone;
    @Column(name = "nm_url_foto_perfil", length = 500)
    private String nmUrlFotoPerfil;

    protected PessoaEntity() {}
    public Integer getIdPessoa() { return idPessoa; }
    public UsuarioEntity getUsuario() { return usuario; }
    public void setUsuario(UsuarioEntity usuario) { this.usuario = usuario; }
    public String getNmCompleto() { return nmCompleto; }
    public void setNmCompleto(String nmCompleto) { this.nmCompleto = nmCompleto; }
    public String getNmCpf() { return nmCpf; }
    public void setNmCpf(String nmCpf) { this.nmCpf = nmCpf; }
    public String getNmNomeUsuario() { return nmNomeUsuario; }
    public void setNmNomeUsuario(String nmNomeUsuario) { this.nmNomeUsuario = nmNomeUsuario; }
    public LocalDate getDtNascimento() { return dtNascimento; }
    public void setDtNascimento(LocalDate dtNascimento) { this.dtNascimento = dtNascimento; }
    public String getNmNacionalidade() { return nmNacionalidade; }
    public void setNmNacionalidade(String nmNacionalidade) { this.nmNacionalidade = nmNacionalidade; }
    public String getNmGenero() { return nmGenero; }
    public void setNmGenero(String nmGenero) { this.nmGenero = nmGenero; }
    public String getNmTelefone() { return nmTelefone; }
    public void setNmTelefone(String nmTelefone) { this.nmTelefone = nmTelefone; }
    public String getNmUrlFotoPerfil() { return nmUrlFotoPerfil; }
    public void setNmUrlFotoPerfil(String nmUrlFotoPerfil) { this.nmUrlFotoPerfil = nmUrlFotoPerfil; }
}
