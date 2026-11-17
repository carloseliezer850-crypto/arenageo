import Link from "next/link";
import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { PerfilDescoberta } from "@/components/PerfilDescoberta";
import { lerDescoberta } from "@/services/servicoDescoberta";
import { ErroApi } from "@/api/cliente";
export const metadata = {
  title: "Minha descoberta | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page() {
  let data;
  try {
    data = await lerDescoberta();
  } catch (e) {
    if (e instanceof ErroApi && e.status === 401) redirect("/entrar");
    throw e;
  }
  return (
    <>
      <Cabecalho />
      <main className="container">
        <h1>Privacidade e disponibilidade</h1>
        <Link href="/perfil">Voltar ao perfil</Link>
        <PerfilDescoberta initial={data} />
      </main>
    </>
  );
}
