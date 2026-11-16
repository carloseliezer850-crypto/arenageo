import type { Metadata } from "next";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { QuadroTatico } from "@/components/quadro-tatico/QuadroTatico";
import { importarQuadro, type Quadro } from "@/components/quadro-tatico/modelo";

export const metadata: Metadata = {
  title: "Quadro compartilhado | ArenaGeo",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let data: { title: string; document: Quadro; expires: string };
  try {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token))
      throw new ErroApi(404, "Indisponível");
    data = await requisitarApi(`/quadros-compartilhados/${token}`);
  } catch (error) {
    return (
      <main className="container">
        <h1>Quadro compartilhado</h1>
        <p role="status">
          {error instanceof ErroApi && error.status === 404
            ? "Este compartilhamento não está disponível. O link pode ter expirado ou sido revogado."
            : "Não foi possível carregar o quadro. Tente atualizar a página."}
        </p>
      </main>
    );
  }
  const document = importarQuadro(JSON.stringify(data.document));
  return (
    <main className="container">
      <h1>{data.title}</h1>
      <p>
        Somente leitura · versão compartilhada pelo dono. Alterações posteriores
        não são publicadas neste link.
      </p>
      <QuadroTatico initial={document} readOnly />
    </main>
  );
}
