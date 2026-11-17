import Link from "next/link";
import { LocalPartida } from "@/components/LocalPartida";
import { ConvidarPartida } from "@/components/Comunicacao";
import { notFound } from "next/navigation";
import { ErroApi } from "@/api/cliente";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { AcoesPartida } from "@/components/AcoesPartida";
import { lerPartida, reservasCompativeis } from "@/services/servicoPartida";
import { validarSessao } from "@/services/sessao";
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
  const manageVenue = Boolean(match.canChangeVenue);
  const options = manageVenue ? await reservasCompativeis(match.id) : [];
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
            {match.venue ? (
              <section aria-label="Local vinculado">
                <p>
                  {match.venue.arena} · {match.venue.space}
                </p>
                <p>
                  {match.venue.status === "CONFIRMADA"
                    ? "Local com reserva confirmada"
                    : match.venue.status === "CANCELADA"
                      ? "Reserva cancelada — local a confirmar com o organizador"
                      : `Situação da reserva: ${match.venue.status}`}
                </p>
                <Link href={`/arenas/${match.venue.arenaId}`}>
                  Consultar arena e espaços
                </Link>
              </section>
            ) : (
              <p>
                Local a confirmar com o organizador. Não há reserva de quadra
                vinculada.
              </p>
            )}
            <p>
              Gratuita · {match.currentPlayers} de {match.maxPlayers}{" "}
              participantes confirmados
            </p>
          </section>
          <aside className="info-card">
            <AcoesPartida
              match={match}
              connected={(await validarSessao()) === "authenticated"}
            />
          </aside>
        </div>
        {manageVenue && <LocalPartida match={match} options={options} />}
        {match.canManage && match.accepting && (
          <ConvidarPartida id={match.id} />
        )}
      </PaginaRota>
      <Rodape />
    </div>
  );
}
