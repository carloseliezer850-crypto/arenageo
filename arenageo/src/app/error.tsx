"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="container">
      <h1>Não foi possível carregar esta página</h1>
      <p>
        Se você acabou de enviar uma alteração, confira o resultado antes de
        repetir o envio.
      </p>
      <button className="primary-button" onClick={reset}>
        Tentar novamente
      </button>{" "}
      <Link href="/">Ir para o início</Link>
    </main>
  );
}
