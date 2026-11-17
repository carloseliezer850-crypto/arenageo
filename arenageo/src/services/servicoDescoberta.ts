"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
import type { DiscoveryConfig } from "@/types/jogador";
export async function lerDescoberta() {
  return requisitarApi<DiscoveryConfig>("/jogadores/me/descoberta", {
    headers: { Authorization: `Bearer ${await obterToken()}` },
  });
}
export async function salvarDescoberta(data: DiscoveryConfig) {
  try {
    const value = await requisitarApi<DiscoveryConfig>(
      "/jogadores/me/descoberta",
      {
        method: "PUT",
        body: data,
        headers: { Authorization: `Bearer ${await obterToken()}` },
      },
    );
    return { ok: true as const, value };
  } catch (e) {
    return {
      ok: false as const,
      message:
        e instanceof ErroApi
          ? e.message
          : "Não foi possível confirmar a alteração. Atualize a página antes de reenviar.",
    };
  }
}
