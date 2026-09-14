import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { Sport } from "@/types/esporte";

export async function obterEsportes(): Promise<Sport[]> {
  return obterApiOuVazio<Sport>(rotasApi.sports);
}

