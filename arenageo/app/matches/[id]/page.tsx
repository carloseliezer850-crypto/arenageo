import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { getMatches } from "@/services/matchService";
import { getSports } from "@/services/sportService";
import { getSkillLevels } from "@/services/skillLevelService";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [matches, sports, skillLevels] = await Promise.all([getMatches(), getSports(), getSkillLevels()]);
  const match = matches.find((item) => item.id === Number(id));

  if (!match) {
    notFound();
  }

  const sport = sports.find((item) => item.id === match.sportId);
  const skill = skillLevels.find((item) => item.id === match.skillLevelId);

  return (
    <div className="app-shell">
      <Header />
      <RoutePage title={match.title} description={match.description}>
        <div className="detail-layout">
          <section className="info-card detail-card">
            <div className="detail-meta">
              <span className="badge">{sport?.name ?? "Esporte"}</span>
              <span className="status-tag">{match.statusId === 1 ? "Aberta" : "Cheia"}</span>
            </div>
            <ul className="detail-list">
              <li><strong>Data:</strong> {new Date(match.dateTime).toLocaleDateString("pt-BR")}</li>
              <li><strong>Horário:</strong> {new Date(match.dateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</li>
              <li><strong>Duração:</strong> {match.durationMinutes} minutos</li>
              <li><strong>Local:</strong> {match.city} - {match.state}</li>
              <li><strong>Nível:</strong> {skill?.name ?? "Nível"}</li>
              <li><strong>Participantes:</strong> {match.currentPlayers} / {match.maxPlayers}</li>
              <li><strong>Vagas:</strong> {Math.max(match.maxPlayers - match.currentPlayers, 0)}</li>
              <li><strong>Visibilidade:</strong> {match.visibility}</li>
            </ul>
          </section>

          <aside className="info-card sidebar-card">
            <h3>Resumo da partida</h3>
            <p>Organizador: {match.creatorId}</p>
            <p>{match.description}</p>
            <button type="button" className="primary-button">Entrar na partida</button>
          </aside>
        </div>
      </RoutePage>
      <Footer />
    </div>
  );
}
