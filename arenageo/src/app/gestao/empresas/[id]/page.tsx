import Link from "next/link";
import { redirect } from "next/navigation";
import { obterToken } from "@/services/sessao";
import { lerEmpresa } from "@/services/servicoGestao";
import { EmpresaEditor } from "@/components/EmpresaEditor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await obterToken())) redirect("/entrar");
  const id = Number((await params).id);
  return (
    <main className="container">
      <Link href="/gestao">Minhas empresas e arenas</Link>
      <h1>Editar empresa</h1>
      <EmpresaEditor id={id} initial={await lerEmpresa(id)} />
    </main>
  );
}
