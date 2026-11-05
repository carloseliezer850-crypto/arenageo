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
  const [sports, matches, players, skillLevels] = await Promise.allSettled([
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
          {sports.status === "fulfilled" && <CategoriasEsportivas sports={sports.value} />}
          {matches.status === "fulfilled" && sports.status === "fulfilled" && skillLevels.status === "fulfilled" && (
            <ListaPartidas matches={matches.value} sports={sports.value} skillLevels={skillLevels.value} />
          )}
          {players.status === "fulfilled" && skillLevels.status === "fulfilled" && (
            <ListaJogadores players={players.value} skillLevels={skillLevels.value} />
          )}
          <CriarPartida />
          <ComoFunciona />
        </div>

        <BannerProprietario />
      </main>

      <Rodape />
    </div>
  );
}

