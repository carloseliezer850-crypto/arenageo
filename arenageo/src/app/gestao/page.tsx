import Link from "next/link";
import { redirect } from "next/navigation";
import { minhasArenas, minhasEmpresas } from "@/services/servicoGestao";
import { obterToken } from "@/services/sessao";
export default async function Page() {
  if (!(await obterToken())) redirect("/entrar");
  const [arenas, empresas] = await Promise.all([
    minhasArenas(),
    minhasEmpresas(),
  ]);
  return (
    <main className="container">
      <Link href="/painel">Voltar ao painel</Link>
      <h1>Minhas arenas</h1>
      {empresas.map((e) => (
        <p key={e.id}>
          <Link href={"/gestao/empresas/" + e.id}>
            Editar empresa: {e.name}
          </Link>
        </p>
      ))}
      <Link href="/cadastro/empresa">Cadastrar empresa e arena</Link>
      <p>
        <Link href="/gestao/nova">Adicionar arena a uma empresa existente</Link>
      </p>
      {arenas.map((a) => (
        <article key={a.id}>
          <h2>
            <Link href={"/gestao/" + a.id}>{a.name}</Link>
          </h2>
          <p>
            {a.company} — {a.status}
          </p>
        </article>
      ))}
    </main>
  );
}
