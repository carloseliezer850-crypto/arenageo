import Link from "next/link";
import { redirect } from "next/navigation";
import { ErroApi } from "@/api/cliente";
import { minhasPartidas } from "@/services/servicoPartida";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
export const metadata = {
  title: "Minhas partidas | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const matches = await minhasPartidas().catch((e) => {
    if (e instanceof ErroApi && e.status === 401) redirect("/entrar");
    throw e;
  });
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Minhas partidas"
        description="Organizando, participando e na lista de espera. Até 100 partidas mais recentes."
      >
        {!matches.length && (
          <p>
            Você ainda não tem partidas. Encontre um jogo ou organize o
            primeiro.
          </p>
        )}
        <div className="match-grid">
          {matches.map((m) => (
            <article className="info-card" key={m.id}>
              <h2>
                <Link href={`/partidas/${m.id}`}>{m.title}</Link>
              </h2>
              <p>
                {m.status} ·{" "}
                {new Date(m.dateTime).toLocaleString("pt-BR", {
                  timeZone: m.timezone,
                })}
              </p>
              <Link href={`/partidas/${m.id}`}>Abrir partida</Link>
            </article>
          ))}
        </div>
        <Link href="/partidas">Encontrar partidas</Link> ·{" "}
        <Link href="/criar-partida">Criar partida</Link>
      </PaginaRota>
      <Rodape />
    </div>
  );
}
