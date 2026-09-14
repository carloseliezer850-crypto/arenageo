import { CartaoJogador } from "@/components/CartaoJogador";
import type { Player } from "@/types/jogador";
import type { SkillLevel } from "@/types/nivelHabilidade";

type ListaJogadoresProps = {
  players: Player[];
  skillLevels: SkillLevel[];
};

export function ListaJogadores({ players, skillLevels }: ListaJogadoresProps) {
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
        {players.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum jogador disponível</h3>
            <p>Os perfis cadastrados aparecerão aqui quando o serviço estiver conectado.</p>
          </div>
        ) : players.map((player) => {
          const skillLevel = skillLevelById.get(player.skillLevelId);

          if (!skillLevel) {
            return null;
          }

          return <CartaoJogador key={player.id} player={player} skillLevel={skillLevel} />;
        })}
      </div>
    </section>
  );
}

