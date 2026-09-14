import { obterApiOuVazio, enviarApi } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { Match } from "@/types/partida";
import type { CriarPartidaRequest } from "@/types/autenticacao";

type MutationResponse = {
  success: boolean;
  message: string;
  data?: Match;
};

export async function obterPartidas(): Promise<Match[]> {
  return obterApiOuVazio<Match>(rotasApi.matches);
}

export function criarPartida(data: CriarPartidaRequest): Promise<MutationResponse> {
  return enviarApi<MutationResponse, CriarPartidaRequest>(rotasApi.matches, data);
}

export async function obterPartidasProximas(): Promise<Match[]> {
  return (await obterPartidas()).filter((match) => match.statusId === 1);
}

