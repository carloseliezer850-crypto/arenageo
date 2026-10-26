package com.arenageo.api.cadastro.mapper;

import com.arenageo.domain.arena.entity.ArenaEntity;
import com.arenageo.domain.empresa.entity.EmpresaEntity;
import com.arenageo.domain.endereco.entity.EnderecoEntity;
import com.arenageo.domain.jogador.entity.JogadorEntity;
import com.arenageo.domain.pessoa.entity.PessoaEntity;
import com.arenageo.domain.usuario.entity.TipoContaEntity;
import com.arenageo.domain.usuario.entity.UsuarioEntity;
import java.time.LocalDate;
import java.util.Locale;
import com.arenageo.api.empresa.dto.CadastroEmpresaRequestDto;
import com.arenageo.api.cadastro.dto.EnderecoCadastroDto;
import com.arenageo.util.DocumentoUtils;
import org.springframework.stereotype.Component;

@Component
public class CadastroMapper {

    public UsuarioEntity criarUsuario(TipoContaEntity tipoConta, String email, String senhaHash) {
        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setTipoConta(tipoConta);
        usuario.setNmEmail(email);
        usuario.setNmSenhaHash(senhaHash);
        usuario.setFlAtivo(true);
        return usuario;
    }

    public PessoaEntity criarPessoa(UsuarioEntity usuario, String nome, String cpf, LocalDate nascimento,
                                    String telefone, String nomeUsuario, String fotoPerfil) {
        PessoaEntity pessoa = new PessoaEntity();
        pessoa.setUsuario(usuario);
        pessoa.setNmCompleto(nome.trim());
        pessoa.setNmCpf(cpf);
        pessoa.setDtNascimento(nascimento);
        pessoa.setNmNacionalidade("Brasileira");
        pessoa.setNmTelefone(textoOuNull(telefone));
        pessoa.setNmNomeUsuario(textoOuNull(nomeUsuario));
        pessoa.setNmUrlFotoPerfil(textoOuNull(fotoPerfil));
        return pessoa;
    }

    public JogadorEntity criarJogador(PessoaEntity pessoa) {
        JogadorEntity jogador = new JogadorEntity();
        jogador.setPessoa(pessoa);
        jogador.setFlAtivo(true);
        return jogador;
    }

    public EmpresaEntity criarEmpresa(PessoaEntity responsavel, CadastroEmpresaRequestDto.EmpresaDto dados, String cnpj) {
        EmpresaEntity empresa = new EmpresaEntity();
        empresa.setPessoaResponsavel(responsavel);
        empresa.setNmRazaoSocial(dados.legalName().trim());
        empresa.setNmNomeFantasia(dados.tradeName().trim());
        empresa.setNmCnpj(cnpj);
        empresa.setNmInscricaoEstadual(textoOuNull(dados.stateRegistration()));
        empresa.setNmTelefoneComercial(dados.businessPhone().trim());
        empresa.setNmEmailComercial(dados.businessEmail().trim().toLowerCase(Locale.ROOT));
        empresa.setFlAtivo(true);
        return empresa;
    }

    public ArenaEntity criarArena(EmpresaEntity empresa, CadastroEmpresaRequestDto.ArenaDto dados) {
        ArenaEntity arena = new ArenaEntity();
        arena.setEmpresa(empresa);
        arena.setNmNome(dados.name().trim());
        arena.setDsDescricao(textoOuVazio(dados.description()));
        arena.setNmUrlImagem(textoOuNull(dados.imageUrl()));
        arena.setNmTelefone(dados.phone().trim());
        arena.setNmEmail(dados.email().trim().toLowerCase(Locale.ROOT));
        arena.setNmWebsite(textoOuNull(dados.website()));
        arena.setNmInstagram(textoOuNull(dados.instagram()));
        arena.setDsHorarioFuncionamento(textoOuVazio(dados.openingHours()));
        arena.setFlAtivo(true);
        return arena;
    }

    public EnderecoEntity criarEnderecoPessoa(PessoaEntity pessoa, EnderecoCadastroDto dados, String tipoEndereco) {
        EnderecoEntity endereco = criarEnderecoBase(dados, tipoEndereco);
        endereco.setPessoa(pessoa);
        return endereco;
    }

    public EnderecoEntity criarEnderecoEmpresa(EmpresaEntity empresa, EnderecoCadastroDto dados, String tipoEndereco) {
        EnderecoEntity endereco = criarEnderecoBase(dados, tipoEndereco);
        endereco.setEmpresa(empresa);
        return endereco;
    }

    public EnderecoEntity criarEnderecoArena(ArenaEntity arena, EnderecoCadastroDto dados, String tipoEndereco) {
        EnderecoEntity endereco = criarEnderecoBase(dados, tipoEndereco);
        endereco.setArena(arena);
        return endereco;
    }

    private EnderecoEntity criarEnderecoBase(EnderecoCadastroDto dados, String tipoEndereco) {
        EnderecoEntity endereco = new EnderecoEntity();
        endereco.setNmTipoEndereco(tipoEndereco);
        endereco.setNmCep(textoOuNull(DocumentoUtils.somenteDigitos(dados.zipCode())));
        String uf = textoOuNull(dados.state());
        endereco.setNmUf(uf == null ? null : uf.toUpperCase(Locale.ROOT));
        endereco.setNmCidade(dados.city().trim());
        endereco.setNmBairro(textoOuNull(dados.neighborhood()));
        endereco.setNmLogradouro(textoOuNull(dados.street()));
        endereco.setNmNumero(textoOuNull(dados.number()));
        endereco.setNmComplemento(textoOuNull(dados.complement()));
        endereco.setNrLatitude(dados.latitude());
        endereco.setNrLongitude(dados.longitude());
        endereco.setFlPrincipal(true);
        return endereco;
    }

    private String textoOuNull(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private String textoOuVazio(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
