import { notFound } from "next/navigation";
import { ErroApi } from "@/api/cliente";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { AcoesPartida } from "@/components/AcoesPartida";
import { lerPartida } from "@/services/servicoPartida";
import { obterToken } from "@/services/sessao";
export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const match = await lerPartida(Number(id)).catch((e) => {
    if (e instanceof ErroApi && e.status === 404) notFound();
    throw e;
  });
  const format = (date: string) =>
    new Date(date).toLocaleString("pt-BR", {
      timeZone: match.timezone,
      dateStyle: "short",
      timeStyle: "short",
    });
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota title={match.title} description={match.description}>
        <div className="detail-layout">
          <section className="info-card">
            <p>
              {match.status} ·{" "}
              {match.currentPlayers >= match.maxPlayers
                ? "Sem vagas imediatas"
                : "Vagas disponíveis"}
            </p>
            <p>Organizador: {match.organizer}</p>
            <p>
              {format(match.dateTime)} até {format(match.endTime)} (
              {match.timezone})
            </p>
            <p>
              {match.location} · {match.city} / {match.state}
            </p>
            <p>
              Local a confirmar com o organizador. Não há reserva de quadra
              vinculada.
            </p>
            <p>
              Gratuita · {match.currentPlayers} de {match.maxPlayers}{" "}
              participantes confirmados
            </p>
          </section>
          <aside className="info-card">
            <AcoesPartida
              match={match}
              connected={Boolean(await obterToken())}
            />
          </aside>
        </div>
      </PaginaRota>
      <Rodape />
    </div>
  );
}
