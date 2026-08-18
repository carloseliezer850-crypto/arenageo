import type { Reservation } from "@/types/reservation";

export const reservations: Reservation[] = [
  {
    id: 1,
    userId: 1,
    spaceId: 1,
    startDateTime: "2026-08-20T18:00:00.000Z",
    endDateTime: "2026-08-20T19:00:00.000Z",
    status: "confirmed",
    totalAmount: 120,
    createdAt: "2026-08-10T09:00:00.000Z",
  },
  {
    id: 2,
    userId: 4,
    spaceId: 3,
    startDateTime: "2026-08-22T20:00:00.000Z",
    endDateTime: "2026-08-22T21:00:00.000Z",
    status: "pending",
    totalAmount: 110,
    createdAt: "2026-08-11T15:00:00.000Z",
  },
];
