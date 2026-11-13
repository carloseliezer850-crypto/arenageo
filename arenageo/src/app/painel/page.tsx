import { minhasPartidas } from "@/services/servicoPartida";
import { ReenviarConfirmacao } from "@/components/ContaAcesso";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { PaginaRota } from "@/components/PaginaRota";
import { buscarArenas, type ArenaResumo } from "@/services/servicoArena";
import { obterToken } from "@/services/sessao";
import { ErroApi } from "@/api/cliente";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string | string[]; uf?: string }>;
}) {
  const token = await obterToken();
  if (!token) redirect("/entrar");
  const jogos = await minhasPartidas()
    .then((items) => ({ items, error: false }))
    .catch(() => ({ items: [], error: true }));
  const params = await searchParams;
  const filtro = params.cidade;
  const uf = params.uf ?? "";
  const cidade = typeof filtro === "string" ? filtro.trim() : "";
  let arenas: ArenaResumo[] = [];
  let erro = false;
  if (cidade) {
    try {
      arenas = await buscarArenas(cidade, token, uf);
    } catch (error) {
      if (error instanceof ErroApi && [401, 403].includes(error.status))
        redirect("/entrar");
      erro = true;
    }
  }

  return (
    <div className="app-shell">
      <Cabecalho />
      <PaginaRota title="Meu painel">
        <h2>Minhas partidas</h2>
        {jogos.error ? (
          <p role="alert">
            Não foi possível carregar suas partidas.{" "}
            <Link href="/minhas-partidas">Tentar novamente</Link>
          </p>
        ) : jogos.items.length ? (
          <ul>
            {jogos.items.slice(0, 5).map((m) => (
              <li key={m.id}>
                <Link href={`/partidas/${m.id}`}>{m.title}</Link> — {m.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Você ainda não tem partidas.{" "}
            <Link href="/partidas">Encontre um jogo</Link> ou{" "}
            <Link href="/criar-partida">organize o primeiro</Link>.
          </p>
        )}
        <Link href="/minhas-partidas">Ver todas as minhas partidas</Link> ·{" "}
        <Link href="/quadro-tatico">Quadro tático local</Link>
        <h2>Encontrar arenas</h2>
        <form action="/painel" className="form-card">
          <label className="field">
            Cidade
            <input
              name="cidade"
              defaultValue={cidade}
              placeholder="Bagé"
              required
              maxLength={120}
            />
          </label>
          <label className="field">
            UF
            <select name="uf" defaultValue={uf}>
              <option value="">Todas</option>
              {"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
                .split(" ")
                .map((uf) => (
                  <option key={uf}>{uf}</option>
                ))}
            </select>
          </label>
          <button className="primary-button">Buscar arenas</button>
        </form>
        {erro && (
          <p role="alert">
            Não foi possível consultar as arenas. Tente novamente.
          </p>
        )}
        {cidade && !erro && arenas.length === 0 && (
          <p>Nenhuma arena encontrada em {cidade}.</p>
        )}
        <div className="dashboard-grid">
          {arenas.map((arena) => (
            <article className="info-card" key={arena.id}>
              <h2>{arena.name}</h2>
              <p>
                {[arena.street, arena.number, arena.city, arena.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {arena.description && <p>{arena.description}</p>}
              {arena.openingHours && (
                <p>Horário de funcionamento: {arena.openingHours}</p>
              )}
            </article>
          ))}
        </div>
        <ReenviarConfirmacao />
        <Link className="text-button" href="/gestao">
          Gerenciar minhas arenas
        </Link>
        <Link className="text-button" href="/perfil">
          Editar meu perfil esportivo
        </Link>
        <Link className="text-button" href="/cadastro/empresa">
          Cadastrar minha empresa e arena
        </Link>
      </PaginaRota>
      <Rodape />
    </div>
  );
}
