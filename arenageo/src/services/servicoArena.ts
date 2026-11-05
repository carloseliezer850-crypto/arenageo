import { requisitarApi } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";

export interface ArenaResumo {
  id: number;
  name: string;
  description: string;
  city: string;
  state: string | null;
  street: string | null;
  number: string | null;
  openingHours: string;
}

export async function buscarArenas(cidade: string, token: string) {
  return requisitarApi<ArenaResumo[]>(rotasApi.arenas + "?" + new URLSearchParams({ cidade }), {
    headers: { Authorization: "Bearer " + token },
  });
}
