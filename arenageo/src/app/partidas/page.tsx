import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { buscarPartidas } from "@/services/servicoPartida";
import { obterEsportes } from "@/services/servicoEsporte";
import { obterNiveisHabilidade } from "@/services/servicoNivelHabilidade";
import type { BuscaPartidas } from "@/types/partidaPlataforma";
export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters: BuscaPartidas = {};
  for (const k of ["cidade", "uf", "esporte", "nivel", "data", "page"] as const)
    if (typeof raw[k] === "string") filters[k] = raw[k];
  const [result, sports, levels] = await Promise.allSettled([
    buscarPartidas(filters),
    obterEsportes(),
    obterNiveisHabilidade(),
  ]);
  const pageLink = (page: number) => {
    const p = new URLSearchParams(filters);
    p.set("page", String(page));
    return "/partidas?" + p;
  };
  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota
        title="Encontrar partidas"
        description="Partidas públicas e gratuitas. As datas dos filtros seguem o fuso de cada partida."
      >
        <form action="/partidas" className="form-card">
          <div className="form-grid two-columns">
            <label className="field">
              Cidade
              <input
                name="cidade"
                defaultValue={filters.cidade}
                maxLength={120}
              />
            </label>
            <label className="field">
              UF
              <select name="uf" defaultValue={filters.uf || ""}>
                <option value="">Todas</option>
                {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                  .split(" ")
                  .map((v) => (
                    <option key={v}>{v}</option>
                  ))}
              </select>
            </label>
            <label className="field">
              Esporte
              <select
                name="esporte"
                defaultValue={filters.esporte || ""}
                disabled={sports.status !== "fulfilled"}
              >
                <option value="">Todos</option>
                {sports.status === "fulfilled" &&
                  sports.value.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              Nível
              <select
                name="nivel"
                defaultValue={filters.nivel || ""}
                disabled={levels.status !== "fulfilled"}
              >
                <option value="">Todos</option>
                {levels.status === "fulfilled" &&
                  levels.value.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              Data
              <input type="date" name="data" defaultValue={filters.data} />
            </label>
          </div>
          <button className="primary-button">Pesquisar</button>{" "}
          <Link href="/partidas">Limpar filtros</Link>
        </form>
        {(sports.status === "rejected" || levels.status === "rejected") && (
          <p role="alert">
            Não foi possível carregar todos os filtros. Recarregue para tentar
            novamente.
          </p>
        )}
        {result.status === "rejected" ? (
          <p role="alert">
            Não foi possível buscar partidas. Revise os filtros e tente
            novamente.
          </p>
        ) : (
          <>
            <p>{result.value.total} partidas encontradas</p>
            <div className="match-grid">
              {result.value.items.map((m) => (
                <article className="info-card" key={m.id}>
                  <h2>
                    <Link href={`/partidas/${m.id}`}>{m.title}</Link>
                  </h2>
                  <p>
                    {m.city} / {m.state}
                  </p>
                  <p>
                    {new Date(m.dateTime).toLocaleString("pt-BR", {
                      timeZone: m.timezone,
                    })}{" "}
                    ({m.timezone})
                  </p>
                  <p>
                    {m.currentPlayers}/{m.maxPlayers} participantes ·{" "}
                    {m.currentPlayers >= m.maxPlayers
                      ? "Lista de espera"
                      : "Vagas disponíveis"}
                  </p>
                  <Link href={`/partidas/${m.id}`}>Ver detalhes</Link>
                </article>
              ))}
            </div>
            {!result.value.items.length && (
              <p>
                Nenhuma partida para estes filtros. Altere a busca ou crie uma
                partida.
              </p>
            )}
            <nav aria-label="Paginação">
              {result.value.page > 0 && (
                <Link href={pageLink(result.value.page - 1)}>Anterior</Link>
              )}{" "}
              {(result.value.page + 1) * result.value.size <
                result.value.total && (
                <Link href={pageLink(result.value.page + 1)}>Próxima</Link>
              )}
            </nav>
          </>
        )}
        <Link className="primary-button" href="/criar-partida">
          Criar partida
        </Link>
      </PaginaRota>
      <Rodape />
    </div>
  );
}
