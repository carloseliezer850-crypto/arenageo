import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoutePage } from "@/components/RoutePage";
import { RegisterBusinessForm } from "@/components/RegisterBusinessForm";

export default function RegisterBusinessPage() {
  return (
    <div className="app-shell">
      <Header />
      <RoutePage
        title="Cadastro de arena / comerciante"
        description="Cadastre sua empresa, sua arena e seus espaços esportivos."
      >
        <RegisterBusinessForm />
      </RoutePage>
      <Footer />
    </div>
  );
}
