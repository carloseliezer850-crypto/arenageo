"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
import type { RegisterBusinessRequest } from "@/types/autenticacao";
export interface GestaoArena {
  arena: RegisterBusinessRequest["arena"];
  address: RegisterBusinessRequest["address"];
  spaces: {
    name: string;
    sportIds: number[];
    covered: boolean;
    floor: string;
    capacity: number | null;
    width: number | null;
    length: number | null;
  }[];
  hours: { day: number; start: number; end: number }[];
  timezone: string;
  exceptions: { date: string; periods: { start: number; end: number }[] }[];
  publish: boolean;
}
export async function minhasEmpresas() {
  return requisitarApi<{ id: number; name: string }[]>("/gestao/empresas", {
    headers: { Authorization: "Bearer " + (await obterToken()) },
  });
}
export async function minhasArenas() {
  return requisitarApi<
    { id: number; name: string; status: string; company: string }[]
  >("/gestao/arenas", {
    headers: { Authorization: "Bearer " + (await obterToken()) },
  });
}
export async function lerArena(id: number) {
  return requisitarApi<GestaoArena>("/gestao/arenas/" + id, {
    headers: { Authorization: "Bearer " + (await obterToken()) },
  });
}
export async function salvarArena(id: number, body: GestaoArena) {
  try {
    const data = await requisitarApi<GestaoArena>("/gestao/arenas/" + id, {
      method: "PUT",
      body,
      headers: { Authorization: "Bearer " + (await obterToken()) },
    });
    return { success: true, message: "Arena salva.", data, fields: {} };
  } catch (e) {
    return {
      success: false,
      message: e instanceof ErroApi ? e.message : "Não foi possível salvar.",
      fields: e instanceof ErroApi ? e.fields : {},
    };
  }
}
export async function novaArena(
  id: number,
  body: Pick<RegisterBusinessRequest, "arena" | "address">,
  key: string,
) {
  try {
    const data = await requisitarApi<{ id: number }>(
      "/gestao/empresas/" + id + "/arenas",
      {
        method: "POST",
        body,
        headers: {
          Authorization: "Bearer " + (await obterToken()),
          "Idempotency-Key": key,
        },
      },
    );
    return { success: true, message: "Arena criada.", data, fields: {} };
  } catch (e) {
    return {
      success: false,
      message:
        e instanceof ErroApi
          ? e.message
          : "Não foi possível confirmar o cadastro.",
      fields: e instanceof ErroApi ? e.fields : {},
    };
  }
}
export type EditarEmpresa = Pick<
  RegisterBusinessRequest,
  "company" | "address"
>;
export async function lerEmpresa(id: number) {
  return requisitarApi<EditarEmpresa>("/gestao/empresas/" + id, {
    headers: { Authorization: "Bearer " + (await obterToken()) },
  });
}
export async function salvarEmpresa(id: number, body: EditarEmpresa) {
  try {
    const data = await requisitarApi<EditarEmpresa>("/gestao/empresas/" + id, {
      method: "PUT",
      body,
      headers: { Authorization: "Bearer " + (await obterToken()) },
    });
    return { success: true, message: "Empresa atualizada.", data, fields: {} };
  } catch (e) {
    return {
      success: false,
      message: e instanceof ErroApi ? e.message : "Não foi possível salvar.",
      fields: e instanceof ErroApi ? e.fields : {},
    };
  }
}
