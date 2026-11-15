"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
export interface Convite {
  id: number;
  matchId: number;
  title: string;
  username: string;
  status: string;
  created: string;
}
export interface Aviso {
  id: number;
  title: string;
  message: string;
  target: string;
  read: boolean;
  created: string;
}
async function headers(): Promise<Record<string, string>> {
  const t = await obterToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
async function mutate(url: string, method: string, body?: unknown) {
  try {
    await requisitarApi(url, { method, body, headers: await headers() });
    return { ok: true, message: "Alteração registrada." };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof ErroApi
          ? e.message
          : "Não foi possível confirmar o resultado. Atualize antes de repetir.",
    };
  }
}
export async function listarAvisos(page: number) {
  return requisitarApi<{ items: Aviso[]; unread: number }>(
    `/notificacoes?page=${page}`,
    { headers: await headers() },
  );
}
export async function marcarLida(id: number) {
  return mutate(`/notificacoes/${id}/lida`, "PUT");
}
export async function listarConvites() {
  return requisitarApi<Convite[]>("/convites", { headers: await headers() });
}
export async function listarEnviados(id: number) {
  return requisitarApi<Convite[]>(`/partidas/${id}/convites`, {
    headers: await headers(),
  });
}
export async function convidarJogador(id: number, username: string) {
  return mutate(`/partidas/${id}/convites`, "POST", { username });
}
export async function responderConvite(id: number, action: string) {
  return mutate(`/convites/${id}/resposta`, "POST", { action });
}
