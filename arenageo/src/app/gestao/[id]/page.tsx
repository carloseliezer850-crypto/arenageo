import { Galeria } from "@/components/Galeria";
import Link from "next/link";
import { redirect } from "next/navigation";
import { lerArena } from "@/services/servicoGestao";
import { obterToken } from "@/services/sessao";
import { catalogosCadastro } from "@/services/servicoCatalogosCadastro";
import { GestaoArena } from "@/components/GestaoArena";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await obterToken())) redirect("/entrar");
  const { id } = await params;
  const [arena, catalog] = await Promise.all([
    lerArena(Number(id)),
    catalogosCadastro(),
  ]);
  return (
    <main className="container">
      <Link href="/gestao">Minhas arenas</Link>
      <h1>Gerenciar {arena.arena.name}</h1>
      {catalog.error ? (
        <p role="alert">{catalog.error}</p>
      ) : (
        <GestaoArena id={Number(id)} initial={arena} sports={catalog.sports} />
      )}
      <section className="form-card">
        <h2>Agenda e reservas</h2>
        <Link href={`/gestao/${id}/agenda`}>Abrir agenda da arena</Link>
        <ul>
          {arena.spaces.map((s) => (
            <li key={s.id}>
              <Link href={`/gestao/espacos/${s.id}`}>
                Preço e reservas: {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Galeria arena={Number(id)} />
    </main>
  );
}
