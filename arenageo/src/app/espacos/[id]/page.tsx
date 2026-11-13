import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { consultarDisponibilidade } from "@/services/servicoReserva";
import { obterToken } from "@/services/sessao";
import { ReservarEspaco } from "@/components/ReservarEspaco";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date = "" } = await searchParams;
  const result = date
    ? await consultarDisponibilidade(Number(id), date)
        .then((data) => ({ data, error: "" }))
        .catch((e: Error) => ({ data: null, error: e.message }))
    : { data: null, error: "" };
  const token = await obterToken();
  return (
    <>
      <Cabecalho />
      <main className="container">
        <Link href="/arenas">Encontrar quadras</Link>
        <h1>Disponibilidade da quadra</h1>
        <form className="form-card">
          <label className="field">
            Data na arena
            <input name="date" type="date" defaultValue={date} required />
          </label>
          <button className="primary-button">Consultar disponibilidade</button>
        </form>
        {result.error && <p role="alert">{result.error}</p>}
        {result.data &&
          (token ? (
            <ReservarEspaco key={date} id={Number(id)} data={result.data} />
          ) : (
            <section className="form-card">
              <h2>{result.data.space}</h2>
              <p>
                {result.data.slots.length} horários disponíveis em {date}. Fuso:{" "}
                {result.data.timezone}.
              </p>
              <Link href="/entrar">
                Entre na sua conta para revisar e confirmar uma reserva
              </Link>
            </section>
          ))}
      </main>
    </>
  );
}
