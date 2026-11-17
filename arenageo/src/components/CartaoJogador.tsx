import Link from "next/link";
import type { Player } from "@/types/jogador";
export function CartaoJogador({ player }: { player: Player }) {
  return (
    <article className="info-card">
      <h3>{player.name}</h3>
      <p>
        @{player.username} · {player.city}/{player.state}
      </p>
      <ul>
        {player.sports.map((s) => (
          <li key={s.id}>
            {s.name} — {s.level}
          </li>
        ))}
      </ul>
      <p>
        Disponibilidade declarada até{" "}
        {player.validUntil.split("-").reverse().join("/")}. Não indica presença
        online.
      </p>
      <Link href={`/jogadores/${player.id}`}>Ver perfil</Link>
    </article>
  );
}
