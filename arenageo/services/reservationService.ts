import { reservations } from "@/mock/reservations";
import type { Reservation } from "@/types/reservation";

export async function getReservations(): Promise<Reservation[]> {
  // Futuramente: return apiGet<Reservation[]>("/api/reservations");
  return reservations;
}
