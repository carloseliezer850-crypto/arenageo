import Link from "next/link";

import { obterToken } from "@/services/sessao";
import { sair } from "@/services/servicoAutenticacao";

const navigation = [
  { label: "Encontrar partidas", href: "/partidas" },
  { label: "Encontrar jogadores", href: "/jogadores" },
  { label: "Quadro Tático", href: "/quadro-tatico" },
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Criar partida", href: "/criar-partida" },
];

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

        <nav className="main-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/quadro-tatico" className="tactical-mobile-link">Quadro Tático</Link>

        <div className="header-actions">
          {conectado ? <>
            <Link href="/painel" className="text-button">Meu painel</Link>
            <form action={sair}><button className="text-button">Sair</button></form>
          </> : <>
            <Link href="/entrar" className="text-button">Entrar</Link>
            <Link href="/cadastro" className="primary-button small">Criar conta</Link>
          </>}
        </div>
      </div>
    </header>
  );
}

