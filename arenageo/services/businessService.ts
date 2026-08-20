import type { Business } from "@/types/business";

const businesses: Business[] = [
  {
    id: 1,
    userId: 51,
    legalName: "Arena Sul Esporte Ltda.",
    tradeName: "Arena Sul",
    cnpj: "12345678000190",
    stateRegistration: "123456789",
    active: true,
    createdAt: "2026-08-01T10:00:00",
  },
];

export async function getBusinesses(): Promise<Business[]> {
  return businesses;
}
