import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-container">
      <h1>Página não encontrada</h1>
      <p>Este conteúdo não existe ou não está disponível para consulta.</p>
      <Link href="/">Voltar ao início</Link>
    </main>
  );
}
