import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";

export default function BusinessDashboardPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage title="Dashboard da arena" description="Painel administrativo para espaços, reservas e itens da operação comercial.">
        <div className="dashboard-grid">
          <article className="info-card">
            <h2>Resumo</h2>
            <p>Reservas, ocupação e uso das quadras.</p>
          </article>
          <article className="info-card">
            <h2>Quadras</h2>
            <p>Gerenciamento de espaços esportivos.</p>
          </article>
          <article className="info-card">
            <h2>Preços e horários</h2>
            <p>Configuração de valores e agendas.</p>
          </article>
          <article className="info-card">
            <h2>Avaliações</h2>
            <p>Feedbacks e reputação da arena.</p>
          </article>
        </div>
      </RoutePage>
      <Footer />
    </div>
  );
}
