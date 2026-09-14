import type { Arena } from "@/types/arena";
import type { Space } from "@/types/espaco";
import type { Sport } from "@/types/esporte";
import { CartaoEspaco } from "@/components/CartaoEspaco";

type ListaEspacosProps = {
  spaces: Space[];
  arenas: Arena[];
  sports: Sport[];
};

export function ListaEspacos({ spaces, arenas, sports }: ListaEspacosProps) {
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

          return <CartaoEspaco key={space.id} space={space} arena={arena} sport={sport} />;
        })}
      </div>
    </section>
  );
}

