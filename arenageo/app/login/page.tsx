import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage title="Entrar" description="Acesse sua conta do ArenaGeo.">
        <LoginForm />
      </RoutePage>
      <Footer />
    </div>
  );
}
