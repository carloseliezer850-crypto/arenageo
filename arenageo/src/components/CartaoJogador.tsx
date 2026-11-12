import Link from "next/link";
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
        </div>
        <Link href={`/jogadores/${player.id}`} className="secondary-button player-button">
          Ver perfil
        </Link>
      </div>
    </article>
  );
}

