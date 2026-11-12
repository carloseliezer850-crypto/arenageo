import { Galeria } from "@/components/Galeria";
import { ReenviarConfirmacao } from "@/components/ContaAcesso";
import Link from "next/link";
import { redirect } from "next/navigation";
import { obterToken } from "@/services/sessao";
import { lerPerfil } from "@/services/servicoPerfil";
import { PerfilJogador } from "@/components/PerfilJogador";
import { ErroApi } from "@/api/cliente";
export default async function Page() {
  if (!(await obterToken())) redirect("/entrar");
  let profile;
  let message = "";
  try {
    profile = await lerPerfil();
  } catch (e) {
    if (e instanceof ErroApi && e.status === 401) redirect("/entrar");
    message =
      e instanceof ErroApi
        ? e.message
        : "Não foi possível carregar seu perfil.";
  }
  return (
    <main className="container">
      <h1>Meu perfil esportivo</h1>
      <Link href="/painel">Voltar ao painel</Link>
      {profile ? (
        <>
          <PerfilJogador initial={profile} />
          <Galeria />
          <ReenviarConfirmacao />
        </>
      ) : (
        <p role="alert">{message}</p>
      )}
    </main>
  );
}
