import { redirect } from "next/navigation";
import { minhasEmpresas } from "@/services/servicoGestao";
import { obterToken } from "@/services/sessao";
import { NovaArena } from "@/components/NovaArena";
export default async function Page() {
  if (!(await obterToken())) redirect("/entrar");
  return (
    <main className="container">
      <h1>Adicionar arena</h1>
      <NovaArena companies={await minhasEmpresas()} />
    </main>
  );
}
