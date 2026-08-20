export interface AccountType {
  id: number;
  code: "PLAYER" | "BUSINESS";
  name: string;
}

export interface User {
  id: number;
  email: string;
  passwordHash?: string;
  accountTypeId: number;
  active: boolean;
  createdAt: string;
}
