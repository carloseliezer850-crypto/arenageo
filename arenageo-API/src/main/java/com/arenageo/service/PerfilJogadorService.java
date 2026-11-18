package com.arenageo.service;

import com.arenageo.dto.cadastro.*;
import com.arenageo.entity.*;
import com.arenageo.exception.*;
import com.arenageo.repository.*;
import com.arenageo.util.ValidacaoCadastro;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilJogadorService {
  private final JogadorRepository jogadores;
  private final JogadorEsporteRepository vinculos;
  private final EnderecoRepository enderecos;
  private final EsporteRepository esportes;
  private final NivelHabilidadeRepository niveis;

  public PerfilJogadorService(
      JogadorRepository j,
      JogadorEsporteRepository v,
      EnderecoRepository e,
      EsporteRepository s,
      NivelHabilidadeRepository n) {
    jogadores = j;
    vinculos = v;
    enderecos = e;
    esportes = s;
    niveis = n;
  }

  @Transactional(readOnly = true)
  public PerfilJogadorDto ler(Integer usuario) {
    return dto(
        jogadores
            .findByPessoa_Usuario_IdUsuario(usuario)
            .orElseThrow(
                () ->
                    new RecursoNaoEncontradoException("Esta conta não possui perfil de jogador.")));
  }

  private PerfilJogadorDto dto(JogadorEntity j) {
    var p = j.getPessoa();
    var e =
        enderecos
            .findByPessoa_IdPessoaAndFlPrincipalTrue(p.getIdPessoa())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Endereço não encontrado."));
    var a =
        new EnderecoCadastroDto(
            e.getNmCep(),
            e.getNmUf(),
            e.getNmCidade(),
            e.getNmBairro(),
            e.getNmLogradouro(),
            e.getNmNumero(),
            e.getNmComplemento(),
            e.getNrLatitude(),
            e.getNrLongitude());
    return new PerfilJogadorDto(
        p.getNmCompleto(),
        p.getNmTelefone(),
        a,
        vinculos.findByJogador_IdJogador(j.getIdJogador()).stream()
            .map(
                v ->
                    new CadastroJogadorRequestDto.EsporteJogadorDto(
                        v.getEsporte().getIdEsporte(),
                        v.getNivelHabilidade() == null
                            ? null
                            : v.getNivelHabilidade().getIdNivelHabilidade()))
            .toList());
  }

  @Transactional
  public PerfilJogadorDto salvar(Integer usuario, PerfilJogadorDto d) {
    var j =
        jogadores
            .bloquearPorUsuario(usuario)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Perfil não encontrado."));
    var p = j.getPessoa();
    p.setNmCompleto(d.name().trim());
    p.setNmTelefone(ValidacaoCadastro.telefone(d.phone(), false, "phone"));
    var e =
        enderecos
            .findByPessoa_IdPessoaAndFlPrincipalTrue(p.getIdPessoa())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Endereço não encontrado."));
    e.setNmCep(com.arenageo.util.DocumentoUtils.cepOpcional(d.address().zipCode()));
    e.setNmUf(d.address().state());
    e.setNmCidade(d.address().city().trim());
    e.setNmBairro(d.address().neighborhood());
    e.setNrLatitude(d.address().latitude());
    e.setNrLongitude(d.address().longitude());
    vinculos.deleteByJogador_IdJogador(j.getIdJogador());
    vinculos.flush();
    Set<Integer> ids = new HashSet<>();
    for (int i = 0; i < d.sports().size(); i++) {
      var s = d.sports().get(i);
      String field = "sports[" + i + "]";
      if (!ids.add(s.sportId()))
        throw new RegraNegocioException(
            "SPORTS_DUPLICATED", field + ".sportId", "Remova o esporte repetido.");
      var sport =
          esportes
              .findByIdEsporteAndFlAtivoTrue(s.sportId())
              .orElseThrow(
                  () ->
                      new RegraNegocioException(
                          "CATALOG_ITEM_UNAVAILABLE",
                          field + ".sportId",
                          "Selecione um esporte disponível."));
      var level =
          niveis
              .findByIdNivelHabilidadeAndFlAtivoTrue(s.skillLevelId())
              .orElseThrow(
                  () ->
                      new RegraNegocioException(
                          "CATALOG_ITEM_UNAVAILABLE",
                          field + ".skillLevelId",
                          "Selecione um nível disponível."));
      vinculos.save(new JogadorEsporteEntity(j, sport, level));
    }
    vinculos.flush();
    return dto(j);
  }
}
