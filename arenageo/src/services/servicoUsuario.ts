import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { User } from "@/types/usuario";

export async function obterUsuarios(): Promise<User[]> {
  return obterApiOuVazio<User>(rotasApi.users);
}

