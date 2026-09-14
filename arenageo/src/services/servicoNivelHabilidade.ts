import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { SkillLevel } from "@/types/nivelHabilidade";

export async function obterNiveisHabilidade(): Promise<SkillLevel[]> {
  return obterApiOuVazio<SkillLevel>(rotasApi.skillLevels);
}

