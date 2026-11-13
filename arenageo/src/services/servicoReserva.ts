"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
import type { ArenaResumo } from "./servicoArena";
import type {
  Disponibilidade,
  EspacoReservavel,
  Orcamento,
  Reserva,
  ReservaConfig,
} from "@/types/reserva";
async function headers(): Promise<Record<string, string>> {
  const token = await obterToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function mutate<T>(
  url: string,
  method: string,
  body: unknown,
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
          : "Não foi possível confirmar o resultado. Consulte suas reservas antes de iniciar outro envio.",
      fields: e instanceof ErroApi ? e.fields : {},
      unknown: !(e instanceof ErroApi),
    };
  }
}
export async function pesquisarArenas(city: string, uf: string) {
  return requisitarApi<ArenaResumo[]>(
    "/arenas?" + new URLSearchParams({ cidade: city, uf }),
  );
}
export async function espacosArena(id: number) {
  return requisitarApi<EspacoReservavel[]>(`/arenas/${id}/espacos`);
}
export async function consultarDisponibilidade(id: number, date: string) {
  return requisitarApi<Disponibilidade>(
    `/espacos/${id}/disponibilidade?` + new URLSearchParams({ date }),
  );
}
export async function orcarReserva(spaceId: number, start: string) {
  return mutate<Orcamento>("/reservas/orcamentos", "POST", { spaceId, start });
}
export async function confirmarReserva(quoteId: string, key: string) {
  return mutate<Reserva>("/reservas", "POST", { quoteId, accepted: true }, key);
}
export async function minhasReservas(page = 0) {
  return requisitarApi<Reserva[]>(`/reservas?page=${page}`, {
    headers: await headers(),
  });
}
export async function lerReserva(id: number) {
  return requisitarApi<Reserva>(`/reservas/${id}`, {
    headers: await headers(),
  });
}
export async function agirReserva(
  id: number,
  action: string,
  version: number,
  reason?: string,
) {
  return mutate<Reserva>(`/reservas/${id}/acoes`, "POST", {
    action,
    version,
    reason,
  });
}
export async function lerConfigReserva(id: number) {
  return requisitarApi<ReservaConfig>(`/gestao/espacos/${id}/reservas-config`, {
    headers: await headers(),
  });
}
export async function salvarConfigReserva(id: number, body: ReservaConfig) {
  return mutate<ReservaConfig>(
    `/gestao/espacos/${id}/reservas-config`,
    "PUT",
    body,
  );
}
export async function agendaArena(id: number, date: string) {
  return requisitarApi<Reserva[]>(
    `/gestao/arenas/${id}/agenda?` + new URLSearchParams({ date }),
    { headers: await headers() },
  );
}
export async function bloquearEspaco(
  body: { spaceId: number; start: string; end: string; reason: string },
  key: string,
) {
  return mutate<Reserva>("/gestao/bloqueios", "POST", body, key);
}
