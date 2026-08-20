import { MatchFilters } from "@/components/MatchFilters";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { getMatches } from "@/services/matchService";
import { getSports } from "@/services/sportService";
import { getSkillLevels } from "@/services/skillLevelService";

export default async function MatchesPage() {
  const [matches, sports, skillLevels] = await Promise.all([
    getMatches(),
    getSports(),
    getSkillLevels(),
  ]);

  return (
    <div className="app-shell">
      <Header />
      <RoutePage
        title="Encontrar partidas"
        description="Pesquise partidas por esporte, cidade, nível e disponibilidade."
      >
        <MatchFilters matches={matches} sports={sports} skillLevels={skillLevels} />
      </RoutePage>
      <Footer />
    </div>
  );
}
