"use server";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
export async function acaoConta(
  action: "recuperar" | "redefinir" | "confirmar" | "reenviar",
  body: unknown,
) {
  try {
    const r = await requisitarApi<{ message: string }>("/conta/" + action, {
      method: "POST",
      body,
      headers:
        action === "reenviar"
          ? { Authorization: "Bearer " + (await obterToken()) }
          : {},
    });
    return { success: true, message: r.message };
  } catch (e) {
    return {
      success: false,
      message:
        e instanceof ErroApi
          ? e.message
          : "Não foi possível enviar a solicitação.",
    };
  }
}
