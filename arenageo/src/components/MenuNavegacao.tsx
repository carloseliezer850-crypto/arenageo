"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { sair } from "@/services/servicoAutenticacao";

const destinos = [
  ["/partidas", "Encontrar partidas"],
  ["/jogadores", "Jogadores"],
  ["/quadro-tatico", "Quadro tático"],
  ["/como-funciona", "Como funciona"],
  ["/criar-partida", "Criar partida"],
];

export function MenuNavegacao({ conectado }: { conectado: boolean }) {
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  const [pagina, setPagina] = useState(path);
  if (pagina !== path) {
    setPagina(path);
    setAberto(false);
  }
  function fechar() { setAberto(false); botao.current?.focus(); }
  return <div className="navigation-shell" onKeyDown={e => {
    if (e.key === "Escape" && aberto) { e.preventDefault(); fechar(); }
  }}>
    <button ref={botao} className="mobile-menu-button" aria-expanded={aberto}
      aria-controls="site-navigation" onClick={() => setAberto(!aberto)}>
      {aberto ? "Fechar menu" : "Menu"}
    </button>
    <div id="site-navigation" className={`navigation-content${aberto ? " is-open" : ""}`}>
      <nav className="main-nav" aria-label="Navegação principal">
        {destinos.map(([href, label]) => <Link key={href} href={href}
          aria-current={path === href || path.startsWith(href + "/") ? "page" : undefined}
          onClick={() => setAberto(false)}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        {conectado ? <>
          <Link href="/painel">Meu painel</Link>
          <Link href="/gestao">Minhas arenas</Link>
          <form action={sair}><button className="text-button">Sair</button></form>
        </> : <>
          <Link href="/entrar">Entrar</Link>
          <Link href="/cadastro" className="primary-button small">Criar conta</Link>
        </>}
      </div>
    </div>
  </div>;
}
