import Link from "next/link";
import { CartaoJogador } from "./CartaoJogador";
import type { Player } from "@/types/jogador";
export function ListaJogadores({ players }: { players: Player[] }) {
  return (
    <section className="players-section" aria-labelledby="players-heading">
      <h2 id="players-heading">Jogadores que querem jogar</h2>
      <p>
        Perfis publicados voluntariamente. Filtre por cidade para encontrar
        pessoas na sua região.
      </p>
      <div className="player-grid">
        {players.map((p) => (
          <CartaoJogador key={p.id} player={p} />
        ))}
        {!players.length && (
          <p>Nenhum perfil público com disponibilidade vigente.</p>
        )}
      </div>
      <Link href="/jogadores">Buscar jogadores</Link>
    </section>
  );
}
