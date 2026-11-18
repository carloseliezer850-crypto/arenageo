import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { FiltrosJogador } from "@/components/FiltrosJogador";
import { CartaoJogador } from "@/components/CartaoJogador";
import { buscarJogadores } from "@/services/servicoJogador";
import { obterEsportes } from "@/services/servicoEsporte";
import { obterNiveisHabilidade } from "@/services/servicoNivelHabilidade";
import { ErroApi } from "@/api/cliente";
export const metadata = {
  title: "Encontrar jogadores | ArenaGeo",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const values: Record<string, string> = {};
  const params = new URLSearchParams();
  for (const k of [
    "query",
    "city",
    "state",
    "sport",
    "level",
    "date",
    "period",
    "page",
  ]) {
    if (typeof raw[k] === "string") {
      values[k] = raw[k];
      if (raw[k]) params.set(k, raw[k]);
    }
  }
  const [sports, levels] = await Promise.all([
    obterEsportes(),
    obterNiveisHabilidade(),
  ]);
  let data;
  let error = "";
  try {
    data = await buscarJogadores(params);
  } catch (e) {
    error =
      e instanceof ErroApi
        ? e.message
        : "Não foi possível consultar os jogadores. Tente novamente.";
  }
  const url = (page: number) => {
    const p = new URLSearchParams(params);
    p.set("page", String(page));
    return `/jogadores?${p}`;
  };
  return (
    <>
      <Cabecalho />
      <main className="container">
        <h1>Encontrar jogadores</h1>
        <p>
          Somente perfis que autorizaram a descoberta e mantêm disponibilidade
          vigente.
        </p>
        <Link href="/perfil/descoberta">Configurar meu perfil público</Link>
        <FiltrosJogador values={values} sports={sports} levels={levels} />
        {error ? (
          <p role="alert">
            {error} <Link href={`/jogadores?${params}`}>Tentar novamente</Link>
          </p>
        ) : (
          data && (
            <>
              <p>{data.total} resultado(s)</p>
              <div className="player-grid">
                {data.items.map((p) => (
                  <CartaoJogador key={p.id} player={p} />
                ))}
                {!data.items.length && (
                  <p>Nenhum jogador encontrado para estes filtros.</p>
                )}
              </div>
              <nav aria-label="Paginação dos jogadores">
                {data.page > 0 && (
                  <Link href={url(data.page - 1)}>Anterior</Link>
                )}{" "}
                {(data.page + 1) * data.size < data.total && (
                  <Link href={url(data.page + 1)}>Próxima</Link>
                )}
              </nav>
            </>
          )
        )}
      </main>
    </>
  );
}
