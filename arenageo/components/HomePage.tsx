import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MatchList } from "@/components/MatchList";
import { PlayerList } from "@/components/PlayerList";
import { SportsCategories } from "@/components/SportsCategories";
import { CreateMatch } from "@/components/CreateMatch";
import { HowItWorks } from "@/components/HowItWorks";
import { OwnerBanner } from "@/components/OwnerBanner";
import { Footer } from "@/components/Footer";
import { getMatches } from "@/services/matchService";
import { getPlayers } from "@/services/playerService";
import { getSkillLevels } from "@/services/skillLevelService";
import { getSports } from "@/services/sportService";

export default async function HomePage() {
  const [sports, matches, players, skillLevels] = await Promise.all([
    getSports(),
    getMatches(),
    getPlayers(),
    getSkillLevels(),
  ]);

  return (
    <div className="app-shell" id="top">
      <Header />

      <main>
        <Hero />

        <div className="container">
          <SportsCategories sports={sports} />
          <MatchList matches={matches} sports={sports} skillLevels={skillLevels} />
          <PlayerList players={players} skillLevels={skillLevels} />
          <CreateMatch />
          <HowItWorks />
        </div>

        <OwnerBanner />
      </main>

      <Footer />
    </div>
  );
}
