export type UserRole = "player" | "owner" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  active: boolean;
}
