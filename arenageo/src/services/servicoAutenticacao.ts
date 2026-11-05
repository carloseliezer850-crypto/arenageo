"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import { COOKIE_SESSAO, obterToken } from "./sessao";
import type { AuthResponse, LoginRequest, RegisterBusinessRequest, RegisterPlayerRequest } from "@/types/autenticacao";

function falha(error: unknown) {
  const message = error instanceof ErroApi ? error.message : "Não foi possível conectar à API.";
  return { success: false, message };
}

async function iniciarSessao(rota: string, body: unknown, lembrar = false) {
  try {
    const resposta = await requisitarApi<AuthResponse>(rota, { method: "POST", body });
    if (!resposta.token) return { success: false, message: "A API não retornou a sessão." };
    (await cookies()).set(COOKIE_SESSAO, resposta.token, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
      path: "/", ...(lembrar ? { maxAge: 7 * 24 * 3600 } : {}),
    });
    return { success: true, message: resposta.message };
  } catch (error) {
    return falha(error);
  }
}

export async function entrar(data: LoginRequest) {
  const rememberMe = data.rememberMe ?? false;
  return iniciarSessao(rotasApi.auth.entrar, { ...data, rememberMe }, rememberMe);
}

export async function cadastrarJogador(data: RegisterPlayerRequest) {
  return iniciarSessao(rotasApi.players, data);
}

export async function cadastrarEmpresa(data: RegisterBusinessRequest) {
  return iniciarSessao(rotasApi.businesses, data);
}

export async function cadastrarEmpresaNaConta(data: Omit<RegisterBusinessRequest, "responsible">) {
  const token = await obterToken();
  if (!token) return { success: false, message: "Entre novamente para cadastrar a arena." };
  try {
    await requisitarApi(rotasApi.businesses + "/minha-conta", {
      method: "POST", body: data, headers: { Authorization: "Bearer " + token },
    });
    return { success: true, message: "Arena cadastrada na sua conta." };
  } catch (error) {
    return falha(error);
  }
}

export async function sair() {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/entrar");
}
