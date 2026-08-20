import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { getPlayers } from "@/services/playerService";
import { getSports } from "@/services/sportService";
import { getSkillLevels } from "@/services/skillLevelService";
import { PlayerFilters } from "@/components/PlayerFilters";

export default async function PlayersPage() {
  const [players, sports, skillLevels] = await Promise.all([
    getPlayers(),
    getSports(),
    getSkillLevels(),
  ]);

  return (
    <div className="app-shell">
      <Header />
      <RoutePage
        title="Encontrar jogadores"
        description="Busque atletas por esporte, cidade, nível e disponibilidade."
      >
        <PlayerFilters players={players} sports={sports} skillLevels={skillLevels} />
      </RoutePage>
      <Footer />
    </div>
  );
}
