import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { FormularioLogin } from "@/components/FormularioLogin";

export default function LoginPage() {
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota title="Entrar" description="Acesse sua conta do ArenaGeo.">
        <FormularioLogin />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

