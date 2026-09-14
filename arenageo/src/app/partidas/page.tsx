import { FiltrosPartida } from "@/components/FiltrosPartida";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { obterPartidas } from "@/services/servicoPartida";
import { obterEsportes } from "@/services/servicoEsporte";
import { obterNiveisHabilidade } from "@/services/servicoNivelHabilidade";

export default async function MatchesPage() {
  const [matches, sports, skillLevels] = await Promise.all([
    obterPartidas(),
    obterEsportes(),
    obterNiveisHabilidade(),
  ]);

  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Encontrar partidas"
        description="Pesquise partidas por esporte, cidade, nível e disponibilidade."
      >
        <FiltrosPartida matches={matches} sports={sports} skillLevels={skillLevels} />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

