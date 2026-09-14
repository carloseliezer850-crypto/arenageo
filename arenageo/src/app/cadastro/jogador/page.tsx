import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { FormularioCadastroJogador } from "@/components/FormularioCadastroJogador";

export default function RegisterPlayerPage() {
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Cadastro de jogador"
        description="Crie seu perfil esportivo e encontre partidas próximas."
      >
        <FormularioCadastroJogador />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

