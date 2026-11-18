import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { FormularioCadastroEmpresa } from "@/components/FormularioCadastroEmpresa";

import { validarSessao } from "@/services/sessao";
import Link from "next/link";

export default async function RegisterBusinessPage() {
  const session = await validarSessao();
  if (session === "unavailable") throw new Error("Não foi possível validar a sessão.");
  const contaExistente = session === "authenticated";
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

