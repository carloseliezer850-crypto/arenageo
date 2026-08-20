import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";

export default function DashboardPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage title="Dashboard" description="Painel do jogador para acompanhar partidas e perfil.">
        <div className="dashboard-grid">
          <article className="info-card">
            <h2>Próximas partidas</h2>
            <p>Lista das partidas confirmadas e próximas.</p>
          </article>
          <article className="info-card">
            <h2>Partidas criadas</h2>
            <p>Controle das partidas que você organizou.</p>
          </article>
          <article className="info-card">
            <h2>Convites</h2>
            <p>Solicitações e convites recebidos.</p>
          </article>
          <article className="info-card">
            <h2>Histórico</h2>
            <p>Jogos anteriores, avaliações e desempenho.</p>
          </article>
        </div>
      </RoutePage>
      <Footer />
    </div>
  );
}
