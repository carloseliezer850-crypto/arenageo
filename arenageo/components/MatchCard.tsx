import type { Match } from "@/types/match";
import type { SkillLevel } from "@/types/skillLevel";
import type { Sport } from "@/types/sport";

type MatchCardProps = {
  match: Match;
  sport: Sport;
  skillLevel: SkillLevel;
};

export function MatchCard({ match, sport, skillLevel }: MatchCardProps) {
  const matchDate = new Date(match.dateTime);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
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
        <span className="match-status">Aberto</span>
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
        <button type="button" className="primary-button small">
          Entrar na partida
        </button>
      </div>
    </article>
  );
}
