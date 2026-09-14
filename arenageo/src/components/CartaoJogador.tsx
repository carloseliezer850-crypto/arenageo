import type { Player } from "@/types/jogador";
import type { SkillLevel } from "@/types/nivelHabilidade";

type CartaoJogadorProps = {
  player: Player;
  skillLevel: SkillLevel;
};

export function CartaoJogador({ player, skillLevel }: CartaoJogadorProps) {
  return (
    <article className="player-card">
      <img src={player.profileImageUrl} alt={player.name} className="player-avatar" />
      <div className="player-card-body">
        <h3>{player.name}</h3>
        <p>{player.city} - {player.state}</p>
        <div className="player-meta">
          <span>{skillLevel.name}</span>
          <span>2,4 km</span>
        </div>
        <button type="button" className="secondary-button player-button">
          Ver perfil
        </button>
      </div>
    </article>
  );
}

