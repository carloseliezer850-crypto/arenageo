const highlights = [
  {
    title: "Busca geolocalizada",
    description: "Localize quadras e arenas por distância, esporte e disponibilidade em segundos.",
  },
  {
    title: "Reservas simples",
    description: "Compare preços, horários e filtros em um fluxo pronto para confirmar a reserva.",
  },
  {
    title: "Ocupação inteligente",
    description: "Ajuda donos de arenas a identificar horários vazios e aumentar a receita.",
  },
  {
    title: "Comissão por reserva",
    description: "O usuário paga pela reserva e a arena recebe o valor líquido de forma transparente.",
  },
];

export function DestaquesPlataforma() {
  return (
    <section className="highlights-section" aria-labelledby="highlights-heading">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Como o ArenaGeo ajuda</p>
          <h2 id="highlights-heading">Mais praticidade para quem joga e mais receita para quem oferece.</h2>
        </div>
      </div>

      <div className="highlights-grid">
        {highlights.map((highlight) => (
          <article key={highlight.title} className="highlight-card">
            <span className="highlight-bullet" aria-hidden="true" />
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

