import { requisitarApi } from "@/api/cliente";
import type { Player, PlayerPage } from "@/types/jogador";
export async function buscarJogadores(params: URLSearchParams) {
  return requisitarApi<PlayerPage>(`/jogadores?${params}`);
}
export async function obterJogadores(): Promise<Player[]> {
  return (await buscarJogadores(new URLSearchParams())).items;
}
export async function obterJogador(id: string) {
  return requisitarApi<Player>(`/jogadores/${encodeURIComponent(id)}`);
}
