import { Cabecalho } from "@/components/Cabecalho";
import { Hero } from "@/components/Destaque";
import { ListaPartidas } from "@/components/ListaPartidas";
import { ListaJogadores } from "@/components/ListaJogadores";
import { CategoriasEsportivas } from "@/components/CategoriasEsportivas";
import { CriarPartida } from "@/components/CriarPartida";
import { ComoFunciona } from "@/components/ComoFunciona";
import { BannerProprietario } from "@/components/BannerProprietario";
import { Rodape } from "@/components/Rodape";
import { obterPartidas } from "@/services/servicoPartida";
import { obterJogadores } from "@/services/servicoJogador";
import { obterNiveisHabilidade } from "@/services/servicoNivelHabilidade";
import { obterEsportes } from "@/services/servicoEsporte";

export default async function PaginaInicial() {
  const [sports, matches, players, skillLevels] = await Promise.all([
    obterEsportes(),
    obterPartidas(),
    obterJogadores(),
    obterNiveisHabilidade(),
  ]);

  return (
    <div className="app-shell" id="top">
      <Cabecalho />

      <main>
        <Hero />

        <div className="container">
          <CategoriasEsportivas sports={sports} />
          <ListaPartidas matches={matches} sports={sports} skillLevels={skillLevels} />
          <ListaJogadores players={players} skillLevels={skillLevels} />
          <CriarPartida />
          <ComoFunciona />
        </div>

        <BannerProprietario />
      </main>

      <Rodape />
    </div>
  );
}

