import type { Business } from "@/types/empresa";
import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";

export async function obterEmpresas(): Promise<Business[]> {
  return obterApiOuVazio<Business>(rotasApi.businesses);
}

