import type { Match } from "./partida";
export interface Partida extends Match {
  organizer: string;
  location: string;
  timezone: string;
  endTime: string;
  status: "RASCUNHO" | "PUBLICADA" | "CANCELADA" | "CONCLUIDA";
  accepting: boolean;
  canComplete: boolean;
  version: number;
  canManage?: boolean;
  participation?: string;
  queuePosition?: number;
}
export interface NovaPartida {
  title: string;
  description: string;
  sportId: number;
  skillLevelId: number;
  location: string;
  city: string;
  state: string;
  dateTime: string;
  timezone: string;
  durationMinutes: number;
  maxPlayers: number;
  participate: boolean;
  publish: boolean;
}
export type BuscaPartidas = {
  cidade?: string;
  uf?: string;
  esporte?: string;
  nivel?: string;
  data?: string;
  page?: string;
};
export type PaginaPartidas = {
  items: Partida[];
  total: number;
  page: number;
  size: number;
};
