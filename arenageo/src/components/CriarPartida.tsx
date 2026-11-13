import Link from "next/link";
export function CriarPartida() {
  return (
    <section className="create-match-section" aria-labelledby="create-match-heading">
      <div className="create-match-panel">
        <div className="create-match-copy">
          <p className="eyebrow">Criar partida</p>
          <h2 id="create-match-heading">Monte seu jogo em poucos passos</h2>
          <p>
            Defina esporte, data, nível, local e quantidade de jogadores. Sua partida fica visível
            para pessoas próximas que querem jogar no mesmo horário.
          </p>
        </div>

        <Link href="/criar-partida" className="primary-button create-button">
          Preparar partida
        </Link>
      </div>
    </section>
  );
}

