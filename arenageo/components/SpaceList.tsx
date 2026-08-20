import type { Arena } from "@/types/arena";
import type { Space } from "@/types/space";
import type { Sport } from "@/types/sport";
import { SpaceCard } from "@/components/SpaceCard";

type SpaceListProps = {
  spaces: Space[];
  arenas: Arena[];
  sports: Sport[];
};

export function SpaceList({ spaces, arenas, sports }: SpaceListProps) {
  const arenaById = new Map(arenas.map((arena) => [arena.id, arena]));
  const sportById = new Map(sports.map((sport) => [sport.id, sport]));

  return (
    <section className="spaces-section" id="spaces" aria-labelledby="spaces-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Espaços próximos</p>
          <h2 id="spaces-heading">Quadras e arenas em destaque</h2>
        </div>
        <a href="#" className="text-link">
          Ver todos
        </a>
      </div>

      <div className="space-grid">
        {spaces.map((space) => {
          const arena = arenaById.get(space.arenaId);
          const sport = sportById.get(space.sportId);

          if (!arena || !sport) {
            return null;
          }

          return <SpaceCard key={space.id} space={space} arena={arena} sport={sport} />;
        })}
      </div>
    </section>
  );
}
