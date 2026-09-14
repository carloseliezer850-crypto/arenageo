import Link from "next/link";

const footerLinks = {
  general: [
    { label: "ArenaGeo", href: "/" },
    { label: "Encontrar partidas", href: "/partidas" },
    { label: "Encontrar jogadores", href: "/jogadores" },
  ],
  company: [
    { label: "Como funciona", href: "/como-funciona" },
    { label: "Criar partida", href: "/criar-partida" },
    { label: "Entrar", href: "/entrar" },
    { label: "Criar conta", href: "/cadastro" },
  ],
};

export function Rodape() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            ArenaGeo
          </Link>
          <p className="footer-copy">
            Conectamos pessoas que querem jogar, completar times e encontrar partidas perto de onde vivem.
          </p>
        </div>

        <div>
          <h3>Plataforma</h3>
          <ul>
            {footerLinks.general.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Empresa</h3>
          <ul>
            {footerLinks.company.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

