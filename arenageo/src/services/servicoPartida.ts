"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
import type {
  Partida,
  NovaPartida,
  BuscaPartidas,
  PaginaPartidas,
} from "@/types/partidaPlataforma";

async function headers(): Promise<Record<string, string>> {
  const token = await obterToken();
  return token ? { Authorization: "Bearer " + token } : {};
}
export async function buscarPartidas(
  filtros: BuscaPartidas = {},
): Promise<PaginaPartidas> {
  const query = new URLSearchParams();
  for (const key of [
    "cidade",
    "uf",
    "esporte",
    "nivel",
    "data",
    "page",
  ] as const)
    if (filtros[key]) query.set(key, filtros[key]!);
  return requisitarApi("/partidas?" + query);
}
export async function obterPartidas() {
  return (await buscarPartidas()).items;
}
export async function obterPartidasProximas() {
  return obterPartidas();
}
export async function lerPartida(id: number): Promise<Partida> {
  return requisitarApi(`/partidas/${id}`, { headers: await headers() });
}
export async function minhasPartidas(): Promise<Partida[]> {
  return requisitarApi("/partidas/minhas", { headers: await headers() });
}
async function mutation(
  url: string,
  method: string,
  body: unknown,
  key?: string,
) {
  try {
    const data = await requisitarApi<Partida>(url, {
      method,
      body,
      headers: {
        ...(await headers()),
        ...(key ? { "Idempotency-Key": key } : {}),
      },
    });
    return {
      success: true as const,
      data,
      message: "Alteração confirmada.",
      fields: {} as Record<string, string>,
      code: "OK",
    };
  } catch (e) {
    return {
      success: false as const,
      message:
        e instanceof ErroApi
          ? e.message
          : "Não foi possível confirmar o resultado. Tente novamente com os mesmos dados ou consulte suas partidas.",
      fields: e instanceof ErroApi ? e.fields : {},
      code: e instanceof ErroApi ? e.code : "RESULT_UNKNOWN",
    };
  }
}
export async function criarPartida(body: NovaPartida, key: string) {
  return mutation("/partidas", "POST", body, key);
}
export async function participarPartida(id: number, leave: boolean) {
  return mutation(`/partidas/${id}/participacao`, "PUT", { leave });
}
export async function mudarEstadoPartida(
  id: number,
  status: string,
  version: number,
  reason?: string,
) {
  return mutation(`/partidas/${id}/estado`, "POST", {
    status,
    version,
    reason,
  });
}
