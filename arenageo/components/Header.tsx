import Link from "next/link";

const navigation = [
  { label: "Encontrar partidas", href: "/matches" },
  { label: "Encontrar jogadores", href: "/players" },
  { label: "Como funciona", href: "/how-it-works" },
  { label: "Criar partida", href: "/create-match" },
];

export function Header() {
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
          <Link href="/login" className="text-button">Entrar</Link>
          <Link href="/register" className="primary-button small">Criar conta</Link>
        </div>
      </div>
    </header>
  );
}
