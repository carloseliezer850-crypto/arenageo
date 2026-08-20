import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { CreateMatchForm } from "@/components/CreateMatchForm";

export default function CreateMatchPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage
        title="Criar partida"
        description="Publique uma partida, escolha o esporte, horário e quantidade de jogadores."
      >
        <CreateMatchForm />
      </RoutePage>
      <Footer />
    </div>
  );
}
