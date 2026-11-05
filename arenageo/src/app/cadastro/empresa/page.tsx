import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { FormularioCadastroEmpresa } from "@/components/FormularioCadastroEmpresa";

import { obterToken } from "@/services/sessao";
import Link from "next/link";

export default async function RegisterBusinessPage() {
  const contaExistente = Boolean(await obterToken());
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Cadastro de arena / comerciante"
        description="Cadastre a empresa e a arena que você administra."
      >
        {!contaExistente && <p>Já joga no ArenaGeo? <Link href="/entrar">Entre com sua conta</Link> para cadastrar a arena.</p>}
        <FormularioCadastroEmpresa contaExistente={contaExistente} />
      </PaginaRota>
      <Rodape />
    </div>
  );
}

