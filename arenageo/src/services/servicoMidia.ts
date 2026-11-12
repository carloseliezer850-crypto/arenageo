"use server";
import { URL_BASE_API, requisitarApi } from "@/api/cliente";
import { obterToken } from "./sessao";
export async function listarMidias(arena?: number) {
  return requisitarApi<{ id: string; position: number }[]>(
    "/midias" + (arena ? "?arena=" + arena : ""),
    { headers: { Authorization: "Bearer " + (await obterToken()) } },
  );
}
export async function enviarMidia(form: FormData) {
  const token = await obterToken();
  if (!token)
    return { success: false, message: "Entre novamente para enviar a imagem." };
  try {
    const r = await fetch(URL_BASE_API + "/midias", {
      method: "POST",
      body: form,
      headers: { Authorization: "Bearer " + token },
    });
    const body = await r.json();
    return {
      success: r.ok,
      message: r.ok
        ? "Imagem enviada."
        : (body.message ?? "Não foi possível enviar a imagem."),
    };
  } catch {
    return {
      success: false,
      message: "Não foi possível enviar a imagem. Tente novamente.",
    };
  }
}
export async function excluirMidia(id: string) {
  await requisitarApi("/midias/" + encodeURIComponent(id), {
    method: "DELETE",
    headers: { Authorization: "Bearer " + (await obterToken()) },
  });
}
export async function ordenarMidias(arena: number, ids: string[]) {
  await requisitarApi("/midias/ordem/" + arena, {
    method: "PUT",
    body: ids,
    headers: { Authorization: "Bearer " + (await obterToken()) },
  });
}
