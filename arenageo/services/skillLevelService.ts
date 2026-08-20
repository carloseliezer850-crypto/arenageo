import { skillLevels } from "@/mock/skillLevels";
import type { SkillLevel } from "@/types/skillLevel";

export async function getSkillLevels(): Promise<SkillLevel[]> {
  return skillLevels;
}
