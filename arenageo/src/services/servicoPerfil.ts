"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
import type { RegisterPlayerRequest } from "@/types/autenticacao";
export interface Perfil {
  name: string;
  phone: string | null;
  address: RegisterPlayerRequest["address"];
  sports: RegisterPlayerRequest["sports"];
}
export async function lerPerfil() {
  const token = await obterToken();
  return requisitarApi<Perfil>("/jogadores/me", {
    headers: { Authorization: "Bearer " + token },
  });
}
export async function salvarPerfil(data: Perfil) {
  const token = await obterToken();
  try {
    const profile = await requisitarApi<Perfil>("/jogadores/me", {
      method: "PUT",
      body: data,
      headers: { Authorization: "Bearer " + token },
    });
    return {
      success: true,
      message: "Perfil atualizado.",
      profile,
      fields: {},
    };
  } catch (e) {
    return {
      success: false,
      message:
        e instanceof ErroApi ? e.message : "Não foi possível salvar agora.",
      fields: e instanceof ErroApi ? e.fields : {},
    };
  }
}
