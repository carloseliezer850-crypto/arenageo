import { players } from "@/mock/players";
import type { Player } from "@/types/player";

export async function getPlayers(): Promise<Player[]> {
  // Futuramente: return apiGet<Player[]>("/api/players");
  return players;
}
