import { spaces } from "@/mock/spaces";
import type { Space } from "@/types/space";

export async function getSpaces(): Promise<Space[]> {
  // Futuramente: return apiGet<Space[]>("/api/spaces");
  return spaces;
}

export async function getFeaturedSpaces(limit = 4): Promise<Space[]> {
  const allSpaces = await getSpaces();
  return allSpaces.filter((space) => space.active).slice(0, limit);
}
