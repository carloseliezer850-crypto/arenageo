import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { obterJogadores } from "@/services/servicoJogador";
import { obterNiveisHabilidade } from "@/services/servicoNivelHabilidade";

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [players, skillLevels] = await Promise.all([obterJogadores(), obterNiveisHabilidade()]);
  const player = players.find((item) => item.id === Number(id));

  if (!player) {
    notFound();
  }

  const skill = skillLevels.find((item) => item.id === player.skillLevelId);

  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota title={player.name} description={`Perfil de ${player.username}`}>
        <div className="detail-layout">
          <section className="info-card detail-card">
            <img src={player.profileImageUrl} alt={player.name} className="detail-avatar" />
            <ul className="detail-list">
              <li><strong>Usuário:</strong> @{player.username}</li>
              <li><strong>Cidade:</strong> {player.city} - {player.state}</li>
              <li><strong>Status:</strong> {player.active ? "Disponível" : "Indisponível"}</li>
              <li><strong>Nível:</strong> {skill?.name ?? "Nível"}</li>
            </ul>
          </section>

          <aside className="info-card sidebar-card">
            <h3>Resumo</h3>
            <p>Jogador ativo em partidas próximas e com perfil esportivo em progresso.</p>
            <button type="button" className="primary-button">Convidar para partida</button>
          </aside>
        </div>
      </PaginaRota>
      <Rodape />
    </div>
  );
}
