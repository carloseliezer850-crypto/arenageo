import { MatchSearch } from "@/components/MatchSearch";

export function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">Encontre gente para jogar</p>
          <h1>Encontre pessoas para jogar.</h1>
          <p className="lead">
            Crie ou entre em partidas perto de você, complete seu time e organize o próximo jogo em minutos.
          </p>

          <MatchSearch />
        </div>

        <div className="hero-panel" aria-label="Resumo do produto">
          <div className="hero-stat">
            <strong>312</strong>
            <span>partidas ativas</span>
          </div>
          <div className="hero-stat">
            <strong>1.8k</strong>
            <span>jogadores próximos</span>
          </div>
          <div className="hero-stat">
            <strong>92%</strong>
            <span>compatibilidade de time</span>
          </div>
        </div>
      </div>
    </section>
  );
}
