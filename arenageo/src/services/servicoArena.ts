import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { Arena } from "@/types/arena";

export async function obterArenas(): Promise<Arena[]> {
  return obterApiOuVazio<Arena>(rotasApi.arenas);
}

