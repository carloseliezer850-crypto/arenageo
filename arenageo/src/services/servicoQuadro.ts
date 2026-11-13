"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
import type { Quadro } from "@/components/quadro-tatico/modelo";
export interface QuadroSalvo {
  id: string;
  title: string;
  document: Quadro;
  revision: number;
  archived: boolean;
  updated: string;
}
export type ResumoQuadro = Omit<QuadroSalvo, "document"> & { sport: string };
async function headers(): Promise<Record<string, string>> {
  const token = await obterToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function action<T>(
  url: string,
  method: string,
  body?: unknown,
  key?: string,
) {
  try {
    return {
      ok: true as const,
      data: await requisitarApi<T>(url, {
        method,
        body,
        headers: {
          ...(await headers()),
          ...(key ? { "Idempotency-Key": key } : {}),
        },
      }),
    };
  } catch (e) {
    return {
      ok: false as const,
      message:
        e instanceof ErroApi
          ? e.message
          : "Não foi possível confirmar o salvamento. Repita o mesmo envio para verificar.",
      unknown: !(e instanceof ErroApi),
      code: e instanceof ErroApi ? e.code : "RESULT_UNKNOWN",
    };
  }
}
export async function listarQuadros(query = "", archived = false) {
  return action<ResumoQuadro[]>(
    "/quadros?" + new URLSearchParams({ query, archived: String(archived) }),
    "GET",
  );
}
export async function abrirQuadro(id: string) {
  return action<QuadroSalvo>(`/quadros/${encodeURIComponent(id)}`, "GET");
}
export async function salvarQuadro(
  id: string | null,
  title: string,
  document: Quadro,
  revision: number,
  key: string,
) {
  return action<QuadroSalvo>(
    id ? `/quadros/${encodeURIComponent(id)}` : "/quadros",
    id ? "PUT" : "POST",
    { title, document, revision },
    key,
  );
}
export async function arquivarQuadro(
  id: string,
  revision: number,
  archived: boolean,
) {
  return action<QuadroSalvo>(`/quadros/${encodeURIComponent(id)}`, "PATCH", {
    revision,
    archived,
  });
}
export async function excluirQuadro(id: string, revision: number) {
  return action<void>(
    `/quadros/${encodeURIComponent(id)}?revision=${revision}`,
    "DELETE",
  );
}
