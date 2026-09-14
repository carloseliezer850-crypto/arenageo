import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { Player } from "@/types/jogador";

export async function obterJogadores(): Promise<Player[]> {
  return obterApiOuVazio<Player>(rotasApi.players);
}

