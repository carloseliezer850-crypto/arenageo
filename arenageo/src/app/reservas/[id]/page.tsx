import Link from "next/link";
import { redirect } from "next/navigation";
import { ErroApi } from "@/api/cliente";
import { Cabecalho } from "@/components/Cabecalho";
import { lerReserva } from "@/services/servicoReserva";
import { ReservaDetalhe } from "@/components/ReservaDetalhe";
export const metadata = {
  title: "Reserva | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await lerReserva(Number(id)).catch((e) => {
    if (e instanceof ErroApi && e.status === 401) redirect("/entrar");
    throw e;
  });
  return (
    <>
      <Cabecalho />
      <main className="container">
        <Link href="/reservas">Minhas reservas</Link>
        {r.canManage && (
          <>
            {" "}
            · <Link href={`/gestao/${r.arenaId}/agenda`}>Agenda da arena</Link>
          </>
        )}
        <h1>
          {r.type === "BLOQUEIO" ? "Bloqueio" : "Reserva"}: {r.space} —{" "}
          {r.arena}
        </h1>
        <ReservaDetalhe reserva={r} />
      </main>
    </>
  );
}
