import type { Match } from "@/types/match";
import type { SkillLevel } from "@/types/skillLevel";
import type { Sport } from "@/types/sport";
import { MatchCard } from "@/components/MatchCard";

type MatchListProps = {
  matches: Match[];
  sports: Sport[];
  skillLevels: SkillLevel[];
};

export function MatchList({ matches, sports, skillLevels }: MatchListProps) {
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
        {matches.map((match) => {
          const sport = sportById.get(match.sportId);
          const skillLevel = skillLevelById.get(match.skillLevelId);

          if (!sport || !skillLevel) {
            return null;
          }

          return <MatchCard key={match.id} match={match} sport={sport} skillLevel={skillLevel} />;
        })}
      </div>
    </section>
  );
}
