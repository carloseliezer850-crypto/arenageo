import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";

const playerSteps = [
  "Crie sua conta.",
  "Informe os esportes que pratica.",
  "Encontre partidas.",
  "Entre em uma partida.",
  "Jogue.",
];

const creatorSteps = [
  "Crie uma partida.",
  "Escolha esporte, data e horário.",
  "Defina quantidade de jogadores.",
  "Encontre jogadores.",
  "Escolha o espaço.",
  "Realize a reserva.",
];

const businessSteps = [
  "Crie uma conta comercial.",
  "Cadastre sua arena.",
  "Cadastre suas quadras e espaços.",
  "Configure horários e preços.",
  "Receba reservas.",
];

export default function HowItWorksPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage
        title="Como funciona"
        description="Entenda os fluxos principais do ArenaGeo para jogadores, organizadores e comerciantes."
      >
        <div className="info-columns">
          <section className="info-card">
            <h2>Para jogadores</h2>
            <ol className="step-list">
              {playerSteps.map((step, index) => (
                <li key={step}><span>{index + 1}</span>{step}</li>
              ))}
            </ol>
          </section>

          <section className="info-card">
            <h2>Para quem cria partidas</h2>
            <ol className="step-list">
              {creatorSteps.map((step, index) => (
                <li key={step}><span>{index + 1}</span>{step}</li>
              ))}
            </ol>
          </section>

          <section className="info-card">
            <h2>Para comerciantes e arenas</h2>
            <ol className="step-list">
              {businessSteps.map((step, index) => (
                <li key={step}><span>{index + 1}</span>{step}</li>
              ))}
            </ol>
          </section>
        </div>
      </RoutePage>
      <Footer />
    </div>
  );
}
