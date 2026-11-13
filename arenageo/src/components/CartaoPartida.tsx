import Link from "next/link";
import type { Match } from "@/types/partida";
import type { SkillLevel } from "@/types/nivelHabilidade";
import type { Sport } from "@/types/esporte";

type CartaoPartidaProps = {
  match: Match;
  sport: Sport;
  skillLevel: SkillLevel;
};

export function CartaoPartida({ match, sport, skillLevel }: CartaoPartidaProps) {
  const matchDate = new Date(match.dateTime);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "timezone" in match ? String(match.timezone) : "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(matchDate);

  return (
    <article className="match-card">
      <div className="match-card-header">
        <div>
          <p className="match-sport">{sport.name}</p>
          <h3>{match.title}</h3>
        </div>
        <span className="match-status">{match.statusId !== 1 ? "Encerrada" : match.currentPlayers >= match.maxPlayers ? "Lista de espera" : "Aberta"}</span>
      </div>

      <div className="match-meta">
        <span>{formattedDate}</span>
        <span>{match.city} - {match.state}</span>
      </div>

      <p className="match-description">{match.description}</p>

      <div className="match-summary">
        <div>
          <strong>{match.currentPlayers}</strong>
          <span> / {match.maxPlayers} jogadores</span>
        </div>
        <span>Nível: {skillLevel.name}</span>
      </div>

      <div className="match-actions">
        <Link href={`/partidas/${match.id}`} className="primary-button small">
          Ver partida
        </Link>
      </div>
    </article>
  );
}

