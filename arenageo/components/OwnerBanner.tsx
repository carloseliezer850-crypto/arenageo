export function OwnerBanner() {
  return (
    <section className="owner-banner" id="owners" aria-labelledby="owner-heading">
      <div className="container owner-banner-inner">
        <div>
          <p className="eyebrow">Para arenas</p>
          <h2 id="owner-heading">Sua arena também entra no jogo</h2>
          <p>
            Disponibilize espaços para partidas, aumente a rotação de usuários e conecte o seu público
            com jogadores que procuram jogar no mesmo horário.
          </p>
        </div>

        <button type="button" className="primary-button light">
          Anunciar minha arena
        </button>
      </div>
    </section>
  );
}
