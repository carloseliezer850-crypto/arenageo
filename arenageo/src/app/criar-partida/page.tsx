import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { FormularioCriarPartida } from "@/components/FormularioCriarPartida";

export default function CriarPartidaPage() {
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Criar partida"
        description="Publique uma partida, escolha o esporte, horário e quantidade de jogadores."
      >
        <FormularioCriarPartida />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

