import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { FormularioCadastroEmpresa } from "@/components/FormularioCadastroEmpresa";

export default function RegisterBusinessPage() {
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Cadastro de arena / comerciante"
        description="Cadastre sua empresa, sua arena e seus espaços esportivos."
      >
        <FormularioCadastroEmpresa />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

