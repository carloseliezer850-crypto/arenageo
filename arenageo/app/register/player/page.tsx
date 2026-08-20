import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { RegisterPlayerForm } from "@/components/RegisterPlayerForm";

export default function RegisterPlayerPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage
        title="Cadastro de jogador"
        description="Crie seu perfil esportivo e encontre partidas próximas."
      >
        <RegisterPlayerForm />
      </RoutePage>
      <Footer />
    </div>
  );
}
