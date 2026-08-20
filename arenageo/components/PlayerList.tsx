import { PlayerCard } from "@/components/PlayerCard";
import type { Player } from "@/types/player";
import type { SkillLevel } from "@/types/skillLevel";

type PlayerListProps = {
  players: Player[];
  skillLevels: SkillLevel[];
};

export function PlayerList({ players, skillLevels }: PlayerListProps) {
  const skillLevelById = new Map(skillLevels.map((level) => [level.id, level]));

  return (
    <section className="players-section" aria-labelledby="players-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Encontrar jogadores</p>
          <h2 id="players-heading">Jogadores perto de você</h2>
        </div>
      </div>

      <div className="player-grid">
        {players.map((player) => {
          const skillLevel = skillLevelById.get(player.skillLevelId);

          if (!skillLevel) {
            return null;
          }

          return <PlayerCard key={player.id} player={player} skillLevel={skillLevel} />;
        })}
      </div>
    </section>
  );
}
