import type { Arena } from "@/types/arena";
import type { Space } from "@/types/space";
import type { Sport } from "@/types/sport";

type SpaceCardProps = {
  space: Space;
  arena: Arena;
  sport: Sport;
};

export function SpaceCard({ space, arena, sport }: SpaceCardProps) {
  return (
    <article className="space-card">
      <div className="space-image-wrap">
        <img src={space.imageUrl} alt={space.name} className="space-image" />
      </div>

      <div className="space-content">
        <div className="space-meta-row">
          <span className="status-pill">Disponível</span>
          <span className="rating-pill">★ {arena.rating.toFixed(1)}</span>
        </div>

        <div className="space-title-row">
          <h3>{space.name}</h3>
          <span className="price-tag">R$ {space.pricePerHour}/h</span>
        </div>

        <p className="space-description">{space.description}</p>

        <div className="space-location">
          <span>{arena.city}</span>
          <span>•</span>
          <span>{arena.state}</span>
        </div>

        <div className="space-details">
          <span>{sport.name}</span>
          <span>{arena.reviewCount} avaliações</span>
        </div>
      </div>
    </article>
  );
}
