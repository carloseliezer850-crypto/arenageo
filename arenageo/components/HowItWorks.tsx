const steps = [
  {
    id: 1,
    title: "Encontre uma partida",
    description: "Procure por esporte, bairro, nível e horário ideal para jogar.",
  },
  {
    id: 2,
    title: "Complete o grupo",
    description: "Veja quem está participando, confirme o nível e converse antes da partida.",
  },
  {
    id: 3,
    title: "Defina o local",
    description: "Escolha a quadra, espaço ou ponto de encontro que melhor combina com o grupo.",
  },
  {
    id: 4,
    title: "Jogue",
    description: "Organize o jogo e torne a partida recorrente com o mesmo grupo de jogadores.",
  },
];

export function HowItWorks() {
  return (
    <section className="process-section" id="how-it-works" aria-labelledby="how-heading">
      <div className="section-heading-row center">
        <div>
          <p className="eyebrow">Como funciona</p>
          <h2 id="how-heading">Do encontro ao jogo em 4 passos</h2>
        </div>
      </div>

      <div className="process-grid">
        {steps.map((step) => (
          <div key={step.id} className="process-card">
            <div className="step-number">0{step.id}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
