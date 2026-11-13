import { redirect } from "next/navigation";
import { obterToken } from "@/services/sessao";
import { obterEsportes } from "@/services/servicoEsporte";
import { obterNiveisHabilidade } from "@/services/servicoNivelHabilidade";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { FormularioCriarPartida } from "@/components/FormularioCriarPartida";

export default async function CriarPartidaPage() {
  if (!(await obterToken())) redirect("/entrar");
  const [sports, levels] = await Promise.all([
    obterEsportes(),
    obterNiveisHabilidade(),
  ]);
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Criar partida"
        description="Publique uma partida, escolha o esporte, horário e quantidade de jogadores."
      >
        <FormularioCriarPartida sports={sports} levels={levels} />
      </PaginaRota>
      <Rodape />
    </div>
  );
}
