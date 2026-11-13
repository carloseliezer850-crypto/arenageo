import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { pesquisarArenas } from "@/services/servicoReserva";
export const metadata = { title: "Encontrar quadras | ArenaGeo" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string; uf?: string }>;
}) {
  const { cidade = "", uf = "" } = await searchParams;
  const results = cidade
    ? await pesquisarArenas(cidade, uf)
        .then((data) => ({ data, error: "" }))
        .catch(() => ({
          data: [],
          error: "Não foi possível consultar as arenas. Tente novamente.",
        }))
    : { data: [], error: "" };
  return (
    <>
      <Cabecalho />
      <main className="container">
        <h1>Encontrar quadras</h1>
        <p>Encontre uma arena e consulte os horários de cada espaço.</p>
        <form className="form-card">
          <label className="field">
            Cidade
            <input
              name="cidade"
              required
              maxLength={120}
              defaultValue={cidade}
            />
          </label>
          <label className="field">
            UF
            <select name="uf" defaultValue={uf}>
              <option value="">Todas</option>
              {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                .split(" ")
                .map((v) => (
                  <option key={v}>{v}</option>
                ))}
            </select>
          </label>
          <button className="primary-button">Buscar arenas</button>
        </form>
        {results.error ? (
          <p role="alert">{results.error}</p>
        ) : cidade && !results.data.length ? (
          <p>Nenhuma arena publicada encontrada nessa cidade.</p>
        ) : null}
        <div className="match-grid">
          {results.data.map((a) => (
            <article key={a.id} className="info-card">
              <h2>
                <Link href={`/arenas/${a.id}`}>{a.name}</Link>
              </h2>
              <p>
                {a.city} / {a.state}
              </p>
              <p>{a.description}</p>
              <Link href={`/arenas/${a.id}`}>Consultar espaços e horários</Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
