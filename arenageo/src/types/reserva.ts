export interface ReservaConfig {
  online: boolean;
  hourlyCents: number;
  durationMinutes: number;
  preparationMinutes: number;
  cancellationHours: number;
  policy: string;
  version: number;
}
export interface EspacoReservavel {
  id: number;
  name: string;
  covered: boolean;
  floor: string | null;
  capacity: number | null;
  online: boolean;
  hourlyCents: number | null;
  durationMinutes: number | null;
}
export interface Disponibilidade {
  space: string;
  arena: string;
  timezone: string;
  config: ReservaConfig;
  slots: string[];
}
export interface Orcamento {
  quoteId: string;
  space: string;
  arena: string;
  start: string;
  end: string;
  expires: string;
  totalCents: number;
  policy: string;
  cancellationHours: number;
  timezone: string;
}
export interface Reserva {
  id: number;
  spaceId: number;
  space: string;
  arenaId: number;
  arena: string;
  type: string;
  status: string;
  start: string;
  end: string;
  timezone: string;
  totalCents: number;
  policy: string;
  cancellationHours: number;
  payment: string;
  version: number;
  reason: string | null;
  checkin: string | null;
  canManage: boolean;
  events?: { action: string; reason: string | null; date: string }[];
}
