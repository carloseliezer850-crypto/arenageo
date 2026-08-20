import { sports } from "@/mock/sports";
import type { Sport } from "@/types/sport";

export async function getSports(): Promise<Sport[]> {
  // Futuramente: return apiGet<Sport[]>("/api/sports");
  return sports;
}
