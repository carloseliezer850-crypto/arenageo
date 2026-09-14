import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { Space } from "@/types/espaco";

export async function obterEspacos(): Promise<Space[]> {
  return obterApiOuVazio<Space>(rotasApi.spaces);
}

export async function obterEspacosDestaque(limit = 4): Promise<Space[]> {
  const allSpaces = await obterEspacos();
  return allSpaces.filter((space) => space.active).slice(0, limit);
}

