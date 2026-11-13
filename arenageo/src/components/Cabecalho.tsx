import Link from "next/link";

import { obterToken } from "@/services/sessao";
import { MenuNavegacao } from "./MenuNavegacao";

export async function Cabecalho() {
  const conectado = Boolean(await obterToken());
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
      </div>
    </header>
  );
}

