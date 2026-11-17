import "server-only";
import { cache } from "react";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { cookies } from "next/headers";

export const COOKIE_SESSAO = "arenageo_sessao";

export async function obterToken() {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  try {
    // A expiração orienta a interface. A API valida a assinatura em cada operação protegida.
    const claims = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    return claims.exp > Date.now() / 1000 ? token : null;
  } catch {
    return null;
  }
}

// Request-scoped memoization only: backend validates signature, account state and session version.
export const validarSessao = cache(
  async (): Promise<"authenticated" | "anonymous" | "unavailable"> => {
    const token = await obterToken();
    if (!token) return "anonymous";
    try {
      await requisitarApi("/usuarios/sessao", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return "authenticated";
    } catch (e) {
      return e instanceof ErroApi && e.status === 401
        ? "anonymous"
        : "unavailable";
    }
  },
);
