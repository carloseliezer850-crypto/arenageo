import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";

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

export default function ComoFuncionaPage() {
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
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
      </PaginaRota>
      <Rodape />
    </div>
  );
}

