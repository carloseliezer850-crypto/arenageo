package com.arenageo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_jogador")
public class JogadorEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_jogador")
    private Integer idJogador;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_pessoa", nullable = false, unique = true)
    private PessoaEntity pessoa;
    @Column(name = "fl_ativo", nullable = false)
    private Boolean flAtivo = true;

    public JogadorEntity() {}
    public Integer getIdJogador() { return idJogador; }
    public PessoaEntity getPessoa() { return pessoa; }
    public void setPessoa(PessoaEntity pessoa) { this.pessoa = pessoa; }
    public Boolean getFlAtivo() { return flAtivo; }
    public void setFlAtivo(Boolean flAtivo) { this.flAtivo = flAtivo; }
}
