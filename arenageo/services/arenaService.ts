import { arenas } from "@/mock/arenas";
import type { Arena } from "@/types/arena";

export async function getArenas(): Promise<Arena[]> {
  // Futuramente: return apiGet<Arena[]>("/api/arenas");
  return arenas;
}
