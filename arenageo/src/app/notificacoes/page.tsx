import Link from "next/link";
import { redirect } from "next/navigation";
import { ErroApi } from "@/api/cliente";
import { Cabecalho } from "@/components/Cabecalho";
import { PrivacidadeConvitesForm } from "@/components/PrivacidadeConvites";
import { CaixaComunicacao } from "@/components/Comunicacao";
import {
  listarAvisos,
  listarConvites,
  lerPrivacidadeConvites,
} from "@/services/servicoComunicacao";
export const metadata = {
  title: "Notificações e convites | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const raw = await searchParams;
  const page = Number(raw.page || 0);
  const [inbox, invites, privacy] = await Promise.all([
    listarAvisos(page),
    listarConvites(),
    lerPrivacidadeConvites(),
  ]).catch((e) => {
    if (e instanceof ErroApi && e.status === 401) redirect("/entrar");
    throw e;
  });
  return (
    <>
      <Cabecalho />
      <main className="container">
        <h1>Notificações e convites</h1>
        <p>
          {inbox.unread} notificações não lidas. Atualize a página para
          consultar novidades.
        </p>
        <PrivacidadeConvitesForm value={privacy} />
        <CaixaComunicacao convites={invites} avisos={inbox.items} />
        <nav aria-label="Paginação das notificações">
          {page > 0 && (
            <Link href={`/notificacoes?page=${page - 1}`}>Anterior</Link>
          )}{" "}
          {inbox.items.length === 20 && (
            <Link href={`/notificacoes?page=${page + 1}`}>Próxima</Link>
          )}
        </nav>
      </main>
    </>
  );
}
