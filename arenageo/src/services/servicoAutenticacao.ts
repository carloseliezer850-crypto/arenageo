"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ErroApi, requisitarApi } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import { COOKIE_SESSAO, obterToken } from "./sessao";
import type {
  AuthResponse,
  LoginRequest,
  RegisterBusinessRequest,
  RegisterPlayerRequest,
} from "@/types/autenticacao";

function falha(error: unknown) {
  const message =
    error instanceof ErroApi
      ? error.message
      : "Não foi possível conectar à API.";
  return {
    success: false,
    message,
    fields: error instanceof ErroApi ? error.fields : {},
    code: error instanceof ErroApi ? error.code : "NETWORK_ERROR",
    status: error instanceof ErroApi ? error.status : 0,
    traceId: error instanceof ErroApi ? error.traceId : undefined,
  };
}

async function iniciarSessao(
  rota: string,
  body: unknown,
  lembrar = false,
  key?: string,
): Promise<AuthResponse> {
  try {
    const resposta = await requisitarApi<AuthResponse>(rota, {
      method: "POST",
      body,
      headers: key ? { "Idempotency-Key": key } : {},
    });
    if (!resposta.token)
      return { success: false, message: "A API não retornou a sessão." };
    (await cookies()).set(COOKIE_SESSAO, resposta.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(lembrar ? { maxAge: 7 * 24 * 3600 } : {}),
    });
    return { success: true, message: resposta.message };
  } catch (error) {
    return falha(error);
  }
}

export async function entrar(data: LoginRequest) {
  const rememberMe = data.rememberMe ?? false;
  return iniciarSessao(
    rotasApi.auth.entrar,
    { ...data, rememberMe },
    rememberMe,
  );
}

export async function cadastrarJogador(
  data: RegisterPlayerRequest,
  key?: string,
) {
  return iniciarSessao(rotasApi.players, data, false, key);
}

export async function cadastrarEmpresa(
  data: RegisterBusinessRequest,
  key?: string,
) {
  return iniciarSessao(rotasApi.businesses, data, false, key);
}

export async function cadastrarEmpresaNaConta(
  data: Omit<RegisterBusinessRequest, "responsible">,
  key?: string,
): Promise<AuthResponse> {
  const token = await obterToken();
  if (!token)
    return {
      success: false,
      message: "Entre novamente para cadastrar a arena.",
    };
  try {
    await requisitarApi(rotasApi.businesses + "/minha-conta", {
      method: "POST",
      body: data,
      headers: {
        Authorization: "Bearer " + token,
        ...(key ? { "Idempotency-Key": key } : {}),
      },
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
