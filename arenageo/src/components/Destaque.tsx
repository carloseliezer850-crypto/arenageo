import { BuscaPartida } from "@/components/BuscaPartida";

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

          <BuscaPartida />
        </div>

        <div className="hero-panel" aria-label="Organize seu próximo jogo">
          <div className="hero-stat"><strong>Encontre</strong><span>Escolha a sua modalidade e cidade.</span></div>
          <div className="hero-stat"><strong>Organize</strong><span>Combine os detalhes com seu grupo.</span></div>
          <div className="hero-stat"><strong>Planeje</strong><span>Monte suas jogadas no quadro tático.</span></div>
        </div>
      </div>
    </section>
  );
}

