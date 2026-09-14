import Link from "next/link";

const navigation = [
  { label: "Encontrar partidas", href: "/partidas" },
  { label: "Encontrar jogadores", href: "/jogadores" },
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Criar partida", href: "/criar-partida" },
];

export function Cabecalho() {
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

        <div className="header-actions">
          <Link href="/entrar" className="text-button">Entrar</Link>
          <Link href="/cadastro" className="primary-button small">Criar conta</Link>
        </div>
      </div>
    </header>
  );
}

