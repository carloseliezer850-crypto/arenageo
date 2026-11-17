import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { ConvidarJogador } from "@/components/ConvidarJogador";
import { obterJogador } from "@/services/servicoJogador";
import { minhasPartidas } from "@/services/servicoPartida";
import { validarSessao } from "@/services/sessao";
import { ErroApi } from "@/api/cliente";
export const metadata = {
  title: "Perfil público de jogador | ArenaGeo",
  robots: { index: false, follow: false },
};
const days = [
  "",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];
const time = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  let player;
  try {
    player = await obterJogador(id);
  } catch (e) {
    if (e instanceof ErroApi && e.status === 404) notFound();
    throw e;
  }
  const session = await validarSessao();
  const matches = session === "authenticated" ? await minhasPartidas() : [];
  return (
    <>
      <Cabecalho />
      <main className="container">
        <Link href="/jogadores">Voltar à busca</Link>
        <h1>{player.name}</h1>
        <p>
          @{player.username} · {player.city}/{player.state}
        </p>
        <p>{player.bio}</p>
        <h2>Esportes e níveis</h2>
        <ul>
          {player.sports.map((s) => (
            <li key={s.id}>
              {s.name} — {s.level}
            </li>
          ))}
        </ul>
        <h2>Disponibilidade declarada</h2>
        <p>
          Fuso {player.timezone}. Até{" "}
          {player.validUntil.split("-").reverse().join("/")}. Confirme os
          detalhes com o jogador; isto não garante presença.
        </p>
        <ul>
          {player.slots.map((s, i) => (
            <li key={i}>
              {days[s.day]} · {time(s.start)}–{time(s.end)}
            </li>
          ))}
        </ul>
        {session === "authenticated" ? (
          <ConvidarJogador
            username={player.username}
            matches={matches.filter((m) => m.canManage && m.accepting)}
          />
        ) : session === "unavailable" ? (
          <p role="alert">
            Não foi possível validar sua sessão. Atualize para convidar.
          </p>
        ) : (
          <Link href="/entrar">Entre para convidar</Link>
        )}
        <Link href="/criar-partida">Criar partida</Link>
      </main>
    </>
  );
}
