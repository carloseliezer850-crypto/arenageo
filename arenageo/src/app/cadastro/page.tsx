import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { SeletorTipoCadastro } from "@/components/SeletorTipoCadastro";

export default function RegisterPage() {
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Criar conta"
        description="Escolha como você deseja utilizar o ArenaGeo."
      >
        <SeletorTipoCadastro />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

