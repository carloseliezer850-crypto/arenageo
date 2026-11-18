import Link from "next/link";

import { validarSessao } from "@/services/sessao";
import { MenuNavegacao } from "./MenuNavegacao";

export async function Cabecalho() {
  const session = await validarSessao();
  const conectado = session === "authenticated";
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="ArenaGeo home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          ArenaGeo
        </Link>

        <MenuNavegacao conectado={conectado} />
        {session === "unavailable" && (
          <p role="status">
            Não foi possível verificar sua sessão. Atualize a página para tentar
            novamente.
          </p>
        )}
      </div>
    </header>
  );
}
