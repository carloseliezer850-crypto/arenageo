import Link from "next/link";
import { ContaAcesso } from "@/components/ContaAcesso";
export default function Page() {
  return (
    <main className="container">
      <h1>Acesso à conta</h1>
      <ContaAcesso />
      <Link href="/entrar">Entrar na conta</Link>
    </main>
  );
}
