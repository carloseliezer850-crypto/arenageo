import Link from "next/link";
import { lerConfigReserva } from "@/services/servicoReserva";
import { ConfigurarReservas } from "@/components/ConfigurarReservas";
export const metadata = {
  title: "Configurar reservas | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const config = await lerConfigReserva(Number(id));
  return (
    <main className="container">
      <Link href="/gestao">Minhas arenas</Link>
      <h1>Preço e condições da quadra</h1>
      <ConfigurarReservas id={Number(id)} initial={config} />
    </main>
  );
}
