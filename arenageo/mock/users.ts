import type { User } from "@/types/user";

export const users: User[] = [
  {
    id: 1,
    name: "João Pereira",
    email: "joao@arenageo.com",
    role: "player",
    createdAt: "2024-01-15T08:30:00.000Z",
    active: true,
  },
  {
    id: 2,
    name: "Arena Sul",
    email: "contato@arenasul.com",
    role: "owner",
    createdAt: "2023-11-02T09:00:00.000Z",
    active: true,
  },
  {
    id: 3,
    name: "Arena Norte",
    email: "contato@arenanorte.com",
    role: "owner",
    createdAt: "2023-10-22T12:00:00.000Z",
    active: true,
  },
  {
    id: 4,
    name: "Maria Luiza",
    email: "maria@arenageo.com",
    role: "player",
    createdAt: "2024-02-18T09:15:00.000Z",
    active: true,
  },
];
