import type { Match } from "@/types/partida";
import type { SkillLevel } from "@/types/nivelHabilidade";
import type { Sport } from "@/types/esporte";
import { CartaoPartida } from "@/components/CartaoPartida";

type ListaPartidasProps = {
  matches: Match[];
  sports: Sport[];
  skillLevels: SkillLevel[];
};

export function ListaPartidas({ matches, sports, skillLevels }: ListaPartidasProps) {
  const sportById = new Map(sports.map((sport) => [sport.id, sport]));
  const skillLevelById = new Map(skillLevels.map((level) => [level.id, level]));

  return (
    <section className="matches-section" aria-labelledby="matches-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Partidas próximas</p>
          <h2 id="matches-heading">Encontre uma partida agora</h2>
        </div>
        <button type="button" className="text-link">
          Ver todas
        </button>
      </div>

      <div className="match-grid">
        {matches.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma partida disponível</h3>
            <p>As partidas publicadas aparecerão aqui quando o serviço estiver conectado.</p>
          </div>
        ) : matches.map((match) => {
          const sport = sportById.get(match.sportId);
          const skillLevel = skillLevelById.get(match.skillLevelId);

          if (!sport || !skillLevel) {
            return null;
          }

          return <CartaoPartida key={match.id} match={match} sport={sport} skillLevel={skillLevel} />;
        })}
      </div>
    </section>
  );
}

