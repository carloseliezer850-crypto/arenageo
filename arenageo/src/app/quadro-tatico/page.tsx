import { obterToken } from "@/services/sessao";
import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { QuadroTatico } from "@/components/quadro-tatico/QuadroTatico";

export const metadata: Metadata = {
  title: "Quadro Tático | ArenaGeo",
  description:
    "Monte formações de futsal, society e futebol. Posicione jogadores e desenhe suas jogadas.",
};

export default async function QuadroTaticoPage() {
  const connected = Boolean(await obterToken());
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Quadro Tático"
        description="Sua ideia de jogo começa aqui. Escolha a modalidade, organize a equipe e desenhe o próximo lance."
      >
        <QuadroTatico connected={connected} />
      </PaginaRota>
      <Rodape />
    </div>
  );
}
