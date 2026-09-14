import { obterApiOuVazio } from "@/api/cliente";
import { rotasApi } from "@/routes/rotasApi";
import type { Reservation } from "@/types/reserva";

export async function obterReservas(): Promise<Reservation[]> {
  return obterApiOuVazio<Reservation>(rotasApi.reservations);
}

