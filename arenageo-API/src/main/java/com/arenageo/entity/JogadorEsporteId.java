package com.arenageo.entity;

import java.io.Serializable;
import java.util.Objects;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class JogadorEsporteId implements Serializable {
    @Column(name = "id_jogador")
    private Integer idJogador;
    @Column(name = "id_esporte")
    private Integer idEsporte;

    public JogadorEsporteId() {}
    public JogadorEsporteId(Integer idJogador, Integer idEsporte) {
        this.idJogador = idJogador;
        this.idEsporte = idEsporte;
    }
    public Integer getIdJogador() { return idJogador; }
    public void setIdJogador(Integer idJogador) { this.idJogador = idJogador; }
    public Integer getIdEsporte() { return idEsporte; }
    public void setIdEsporte(Integer idEsporte) { this.idEsporte = idEsporte; }

    @Override
    public boolean equals(Object objeto) {
        if (this == objeto) return true;
        if (!(objeto instanceof JogadorEsporteId outro)) return false;
        return Objects.equals(idJogador, outro.idJogador)
            && Objects.equals(idEsporte, outro.idEsporte);
    }
    @Override
    public int hashCode() { return Objects.hash(idJogador, idEsporte); }
}
