export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface Reservation {
  id: number;
  userId: number;
  spaceId: number;
  startDateTime: string;
  endDateTime: string;
  status: ReservationStatus;
  totalAmount: number;
  createdAt: string;
}
