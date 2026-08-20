import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { RegisterTypeSelector } from "@/components/RegisterTypeSelector";

export default function RegisterPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage
        title="Criar conta"
        description="Escolha como você deseja utilizar o ArenaGeo."
      >
        <RegisterTypeSelector />
      </RoutePage>
      <Footer />
    </div>
  );
}
