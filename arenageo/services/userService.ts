import { users } from "@/mock/users";
import type { User } from "@/types/user";

export async function getUsers(): Promise<User[]> {
  // Futuramente: return apiGet<User[]>("/api/users");
  return users;
}
