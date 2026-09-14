import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { obterJogadores } from "@/services/servicoJogador";
import { obterEsportes } from "@/services/servicoEsporte";
import { obterNiveisHabilidade } from "@/services/servicoNivelHabilidade";
import { FiltrosJogador } from "@/components/FiltrosJogador";

export default async function PlayersPage() {
  const [players, sports, skillLevels] = await Promise.all([
    obterJogadores(),
    obterEsportes(),
    obterNiveisHabilidade(),
  ]);

  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Encontrar jogadores"
        description="Busque atletas por esporte, cidade, nível e disponibilidade."
      >
        <FiltrosJogador players={players} sports={sports} skillLevels={skillLevels} />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

