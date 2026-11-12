"use server";
import { obterApi } from "@/api/cliente";
import type { Sport } from "@/types/esporte";
import type { SkillLevel } from "@/types/nivelHabilidade";
export async function catalogosCadastro() {
  try {
    const [sports, levels] = await Promise.all([
      obterApi<Sport[]>("/esportes"),
      obterApi<SkillLevel[]>("/niveis"),
    ]);
    return {
      sports: sports.filter((s) => s.active),
      levels: levels.filter((l) => l.active),
      error: "",
    };
  } catch {
    return {
      sports: [],
      levels: [],
      error: "Não foi possível carregar os esportes e níveis. Tente novamente.",
    };
  }
}
