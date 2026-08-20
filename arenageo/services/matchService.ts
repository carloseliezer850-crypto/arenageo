import { matches } from "@/mock/matches";
import type { Match } from "@/types/match";
import type { CreateMatchRequest } from "@/types/auth";

export async function getMatches(): Promise<Match[]> {
  // Futuramente: return apiGet<Match[]>("/api/matches");
  return matches;
}

export async function createMatch(data: CreateMatchRequest) {
  return {
    success: true,
    message: "Partida criada com sucesso (mock).",
    data,
  };
}

export async function getNearbyMatches(): Promise<Match[]> {
  return (await getMatches()).filter((match) => match.statusId === 1);
}
